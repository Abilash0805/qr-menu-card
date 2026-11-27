/*
  Data layer shared by the guest menu, the admin and the print page.

  LIVE mode  (config.js filled in): Supabase. Menu and orders live in the database.
  DEMO mode  (config.js empty):     menu-data.js + this browser's storage.
*/
(() => {
  const cfg = window.QRMENU_CONFIG || {};
  const live = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const sb = live ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("qrmenu") : null;
  const local = new Set();
  const fire = topic => local.forEach(l => l.topic === topic && l.fn());
  if (bc) bc.onmessage = e => fire(e.data);
  window.addEventListener("storage", e => {
    if (e.key === "qrmenu-orders") fire("orders");
    if (e.key === "qrmenu-menu") fire("menu");
  });
  const on = (topic, fn) => { const l = { topic, fn }; local.add(l); return () => local.delete(l); };
  const ping = topic => { bc?.postMessage(topic); fire(topic); };
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "x" + Date.now().toString(36) + Math.random().toString(36).slice(2));
  const errText = e => (e && (e.message || e.error_description)) || String(e);

  /* ---------------- Menu ---------------- */
  const demoMenu = () => store.get("qrmenu-menu") || window.MENU;
  let menuChannel = null, ordersChannel = null;

  const Backend = {
    live,
    errText,

    async loadMenu() {
      if (!live) return demoMenu();
      const { data, error } = await sb.from("menu").select("doc").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data?.doc || window.MENU;
    },
    async saveMenu(doc) {
      if (!live) { store.set("qrmenu-menu", doc); ping("menu"); return; }
      const { error } = await sb.from("menu").upsert({ id: 1, doc, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onMenuChange(fn) {
      if (live && !menuChannel) {
        menuChannel = sb.channel("menu-feed")
          .on("postgres_changes", { event: "*", schema: "public", table: "menu" }, () => fire("menu"))
          .subscribe();
      }
      return on("menu", fn);
    },

    /* ---------------- Guests ---------------- */
    async placeOrder({ table, items, note }) {
      const lines = items.map(i => ({ id: i.id, qty: i.qty }));
      if (live) {
        const { data, error } = await sb.rpc("place_order", { p_table: table, p_items: lines, p_note: note || "" });
        if (error) throw error;
        return data[0];
      }
      // Demo: same checks the server does
      const all = new Map(demoMenu().sections.flatMap(s => s.items.map(i => [i.id, i])));
      let subtotal = 0;
      const rows = lines.map(l => {
        const it = all.get(l.id);
        if (!it) throw new Error("A dish in your order is no longer on the menu");
        if (it.available === false) throw new Error(`${it.name} is sold out`);
        subtotal += (it.price || 0) * l.qty;
        return { id: it.id, name: it.name, qty: l.qty, price: it.price ?? null };
      });
      const o = { id: uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), table_no: table, kind: "order", items: rows, subtotal, note: (note || "").slice(0, 300), status: "new" };
      store.set("qrmenu-orders", [...store.get("qrmenu-orders", []), o].slice(-500)); ping("orders");
      return o;
    },
    async placeRequest(table, what) {
      if (live) {
        const { error } = await sb.rpc("place_request", { p_table: table, p_what: what });
        if (error) throw error; return;
      }
      const all = store.get("qrmenu-orders", []);
      if (all.some(o => o.kind === "request" && o.table_no === table && o.note === what && o.status === "new")) return;
      all.push({ id: uuid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), table_no: table, kind: "request", items: [], subtotal: 0, note: what, status: "new" });
      store.set("qrmenu-orders", all.slice(-500)); ping("orders");
    },
    async orderStatus(ids) {
      if (!ids.length) return [];
      if (live) {
        const { data, error } = await sb.rpc("order_status", { p_ids: ids });
        if (error) throw error; return data;
      }
      return store.get("qrmenu-orders", []).filter(o => ids.includes(o.id));
    },
    onGuestOrdersChange(fn) { return live ? () => {} : on("orders", fn); },   // live mode: guests poll

    /* ---------------- Staff ---------------- */
    async listOrders(sinceMs = 864e5) {
      const since = new Date(Date.now() - sinceMs).toISOString();
      if (!live) return store.get("qrmenu-orders", []).filter(o => o.created_at >= since);
      const out = [];
      for (let from = 0; ; from += 1000) {                     // page through (Supabase caps at 1000 rows)
        const { data, error } = await sb.from("orders").select("*").gte("created_at", since).order("created_at").range(from, from + 999);
        if (error) throw error;
        out.push(...data);
        if (data.length < 1000) return out;
      }
    },
    async setStatus(id, status) {
      if (!live) {
        store.set("qrmenu-orders", store.get("qrmenu-orders", []).map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o));
        ping("orders"); return;
      }
      const { error } = await sb.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onOrdersChange(fn) {
      if (live && !ordersChannel) {
        ordersChannel = sb.channel("orders-feed")
          .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fire("orders"))
          .subscribe();
      }
      return on("orders", fn);
    },
    clearDemo() { if (!live) { store.del("qrmenu-orders"); ping("orders"); } },
    resetDemoMenu() { if (!live) { store.del("qrmenu-menu"); ping("menu"); } },

    async session() {
      if (!live) return { demo: true };
      const { data } = await sb.auth.getSession();
      return data.session;
    },
    async isStaff() {
      if (!live) return true;
      const { data, error } = await sb.rpc("is_staff");
      return !error && data === true;
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { if (live) await sb.auth.signOut(); location.reload(); }
  };

  window.Backend = Backend;
})();
