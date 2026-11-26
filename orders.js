/*
  Orders layer shared by the guest menu (index.html) and the admin (admin.html).
  Uses Supabase when config.js has credentials, otherwise this browser's storage.
*/
(() => {
  const cfg = window.QRMENU_CONFIG || {};
  const live = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);
  const sb = live ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  const listeners = new Set();
  const emit = () => listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } });

  /* ---- Demo mode storage (same browser, synced across tabs) ---- */
  const LK = "qrmenu-orders";
  const bc = "BroadcastChannel" in window ? new BroadcastChannel("qrmenu-orders") : null;
  if (bc) bc.onmessage = emit;
  window.addEventListener("storage", e => { if (e.key === LK) emit(); });
  const lread = () => { try { return JSON.parse(localStorage.getItem(LK)) || []; } catch { return []; } };
  const lwrite = a => { try { localStorage.setItem(LK, JSON.stringify(a.slice(-300))); } catch {} bc?.postMessage(1); emit(); };
  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2));

  let channel = null;
  const DAY = 864e5;

  window.Orders = {
    live,

    /* Guest: send an order or a service request */
    async place({ table, kind = "order", items = [], subtotal = 0, note = "" }) {
      const row = {
        table_no: String(table || "?").slice(0, 8),
        kind,
        items: items.slice(0, 50).map(i => ({ id: i.id, name: String(i.name).slice(0, 80), qty: i.qty, price: i.price })),
        subtotal: Math.max(0, Math.round(subtotal)),
        note: String(note).slice(0, 300)
      };
      if (live) {
        const { error } = await sb.from("orders").insert(row);   // no read-back: guests can't read orders
        if (error) throw error;
        return;
      }
      lwrite([...lread(), { ...row, id: newId(), created_at: new Date().toISOString(), status: "new" }]);
    },

    /* Admin: today's orders, oldest first */
    async list() {
      const since = new Date(Date.now() - DAY).toISOString();
      if (live) {
        const { data, error } = await sb.from("orders").select("*").gte("created_at", since).order("created_at");
        if (error) throw error;
        return data;
      }
      return lread().filter(o => o.created_at >= since);
    },

    async setStatus(id, status) {
      if (live) {
        const { error } = await sb.from("orders").update({ status }).eq("id", id);
        if (error) throw error;
        return;
      }
      lwrite(lread().map(o => (o.id === id ? { ...o, status } : o)));
    },

    subscribe(fn) {
      listeners.add(fn);
      if (live && !channel) {
        channel = sb.channel("orders-feed")
          .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, emit)
          .subscribe();
      }
      return () => listeners.delete(fn);
    },

    /* Staff login (live mode only) */
    async session() {
      if (!live) return { demo: true };
      const { data } = await sb.auth.getSession();
      return data.session;
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { if (live) await sb.auth.signOut(); location.reload(); },

    clearDemo() { if (!live) lwrite([]); }
  };
})();
