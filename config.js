/*
  Backend connection (Supabase → Project Settings → API Keys).

  Leave both values empty  → DEMO MODE: menu-data.js + this browser only.
  Filled in                → LIVE MODE: menu and orders in the database, live on every phone.

  The anon key is meant to be public. The database rules in supabase/schema.sql
  decide what it can do: guests can read the menu and place orders through
  checked functions, nothing else. Never put the service_role key here.
*/
window.QRMENU_CONFIG = {
  supabaseUrl: "https://pmnogcmquoyplyiiwvco.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbm9nY21xdW95cGx5aWl3dmNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3NzYxODAsImV4cCI6MjExMTM1MjE4MH0.ZIUbTYtamDE9ACCliQsMvU3OF_O92gUlWmWK-0snH48"
};
