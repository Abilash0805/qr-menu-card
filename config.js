/*
  Backend connection.

  Leave both values empty  → DEMO MODE: orders are kept in this browser only
                             (open the menu and admin in two tabs to try it).
  Fill them in             → LIVE MODE: orders from every phone reach the admin
                             dashboard in real time (see SETUP-ORDERS.md).

  Both values come from Supabase → Project Settings → API.
  The anon/publishable key is safe to publish: the database rules in
  supabase-schema.sql decide what it can do (guests can only add orders).
*/
window.QRMENU_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
