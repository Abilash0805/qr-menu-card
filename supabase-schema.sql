-- QR Menu Card: orders table + security rules.
-- Paste this whole file into Supabase → SQL Editor → New query → Run.

-- 1. Who counts as staff (can see and update orders).
create table if not exists public.staff (
  email text primary key
);
alter table public.staff enable row level security;
-- No policies on staff: only the dashboard/SQL editor can change it.

-- 👉 Replace with the email(s) of the staff login(s) you create under Authentication → Users.
insert into public.staff (email) values ('owner@example.com')
on conflict do nothing;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.staff where email = (auth.jwt() ->> 'email'));
$$;

-- 2. Orders and service requests.
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  table_no   text not null check (char_length(table_no) between 1 and 8),
  kind       text not null default 'order' check (kind in ('order', 'request')),
  items      jsonb not null default '[]'::jsonb
             check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 50),
  subtotal   integer not null default 0 check (subtotal between 0 and 10000000),
  note       text check (char_length(note) <= 300),
  status     text not null default 'new'
             check (status in ('new', 'preparing', 'served', 'done', 'cancelled'))
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Guests (anyone with the menu link) can only ADD new orders. They cannot read or change any.
drop policy if exists "guests place orders" on public.orders;
create policy "guests place orders" on public.orders
  for insert to anon, authenticated
  with check (status = 'new');

drop policy if exists "staff read orders" on public.orders;
create policy "staff read orders" on public.orders
  for select to authenticated using (public.is_staff());

drop policy if exists "staff update orders" on public.orders;
create policy "staff update orders" on public.orders
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

grant insert on public.orders to anon;
grant select, insert, update on public.orders to authenticated;

-- 3. Live updates for the admin dashboard.
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null; end $$;
