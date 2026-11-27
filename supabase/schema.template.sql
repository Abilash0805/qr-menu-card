-- ============================================================
--  QR Menu Card — database setup
--  Paste this whole file into Supabase → SQL Editor → New query → Run.
--  Safe to run more than once.
-- ============================================================

-- 👉 STEP 1: put the staff login email(s) here (the same email you add under Authentication → Users).
create table if not exists public.staff (email text primary key);
insert into public.staff (email) values ('owner@example.com') on conflict do nothing;

alter table public.staff enable row level security;   -- no policies: only the dashboard can edit it

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ------------------------------------------------------------
--  Menu: one published document (restaurant details + sections + dishes)
-- ------------------------------------------------------------
create table if not exists public.menu (
  id         int primary key default 1 check (id = 1),
  doc        jsonb not null check (jsonb_typeof(doc -> 'sections') = 'array'),
  updated_at timestamptz not null default now()
);
alter table public.menu enable row level security;

drop policy if exists "anyone reads menu" on public.menu;
create policy "anyone reads menu" on public.menu for select to anon, authenticated using (true);
drop policy if exists "staff edit menu" on public.menu;
create policy "staff edit menu" on public.menu for all to authenticated using (public.is_staff()) with check (public.is_staff());
grant select on public.menu to anon;
grant select, insert, update on public.menu to authenticated;

insert into public.menu (id, doc) values (1, $menu$__MENU_JSON__$menu$::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
--  Orders and service requests
-- ------------------------------------------------------------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  table_no   text not null check (table_no ~ '^[A-Za-z0-9-]{1,8}$'),
  kind       text not null default 'order' check (kind in ('order', 'request')),
  items      jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  subtotal   integer not null default 0 check (subtotal >= 0),
  note       text check (char_length(note) <= 300),
  status     text not null default 'new' check (status in ('new', 'preparing', 'served', 'done', 'cancelled'))
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_table_idx on public.orders (table_no, created_at desc);

alter table public.orders enable row level security;
drop policy if exists "guests place orders" on public.orders;          -- guests go through place_order() only
drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff());
drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());
revoke insert, update, delete on public.orders from anon;
grant select, update on public.orders to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- Guests place orders here. Prices and availability are checked against the
-- published menu on the server, so a tampered phone can't change the bill.
create or replace function public.place_order(p_table text, p_items jsonb, p_note text default '')
returns table (id uuid, subtotal integer, items jsonb)
language plpgsql security definer set search_path = public as $$
declare
  v_doc jsonb; e jsonb; it jsonb; v_qty int; v_price int;
  v_items jsonb := '[]'::jsonb; v_total int := 0; v_id uuid;
begin
  if p_table is null or p_table !~ '^[A-Za-z0-9-]{1,8}$' then raise exception 'Unknown table'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Your order is empty'; end if;
  if jsonb_array_length(p_items) > 30 then raise exception 'Too many different dishes in one order'; end if;
  if (select count(*) from orders o where o.table_no = p_table and o.created_at > now() - interval '1 minute') >= 4 then
    raise exception 'Please wait a moment before sending another order';
  end if;

  select m.doc into v_doc from menu m where m.id = 1;
  for e in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((e ->> 'qty')::int, 0);
    if v_qty < 1 or v_qty > 20 then raise exception 'Invalid quantity'; end if;
    select x into it from jsonb_array_elements(v_doc -> 'sections') s, jsonb_array_elements(s -> 'items') x
      where x ->> 'id' = e ->> 'id' limit 1;
    if it is null then raise exception 'A dish in your order is no longer on the menu'; end if;
    if (it ->> 'available') = 'false' then raise exception '% is sold out', it ->> 'name'; end if;
    v_price := (it ->> 'price')::int;
    v_items := v_items || jsonb_build_object('id', it ->> 'id', 'name', it ->> 'name', 'qty', v_qty, 'price', v_price);
    v_total := v_total + coalesce(v_price, 0) * v_qty;
  end loop;

  insert into orders (table_no, kind, items, subtotal, note)
  values (p_table, 'order', v_items, v_total, left(coalesce(p_note, ''), 300))
  returning orders.id into v_id;
  return query select v_id, v_total, v_items;
end $$;

create or replace function public.place_request(p_table text, p_what text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if p_table is null or p_table !~ '^[A-Za-z0-9-]{1,8}$' then raise exception 'Unknown table'; end if;
  if p_what not in ('Call server', 'Water', 'Bill', 'Cutlery') then raise exception 'Unknown request'; end if;
  if exists (select 1 from orders o where o.table_no = p_table and o.kind = 'request' and o.note = p_what
             and o.status = 'new' and o.created_at > now() - interval '10 minutes') then
    select o.id into v_id from orders o where o.table_no = p_table and o.kind = 'request' and o.note = p_what and o.status = 'new' limit 1;
    return v_id;                                   -- already waiting: don't duplicate
  end if;
  insert into orders (table_no, kind, note) values (p_table, 'request', p_what) returning id into v_id;
  return v_id;
end $$;

-- Guests track their own orders by id (ids are random and unguessable).
create or replace function public.order_status(p_ids uuid[])
returns table (id uuid, status text, created_at timestamptz, updated_at timestamptz, items jsonb, subtotal integer, note text)
language sql stable security definer set search_path = public as $$
  select o.id, o.status, o.created_at, o.updated_at, o.items, o.subtotal, o.note
  from orders o where o.id = any (p_ids[1:20]) and o.kind = 'order' order by o.created_at;
$$;

revoke all on function public.place_order(text, jsonb, text), public.place_request(text, text), public.order_status(uuid[]) from public;
grant execute on function public.place_order(text, jsonb, text), public.place_request(text, text), public.order_status(uuid[]) to anon, authenticated;

-- ------------------------------------------------------------
--  Live updates
-- ------------------------------------------------------------
do $$ begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.menu;   exception when duplicate_object then null; end $$;
