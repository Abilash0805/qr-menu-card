# QR Menu Card — sample

A guest menu that opens when a table's QR code is scanned, an admin page for the restaurant, and printable table QR cards.

**Live:** https://abilash0805.github.io/qr-menu-card/

| Page | Who it's for | What it does |
|---|---|---|
| `index.html` (`/?t=7`) | Guests | The menu. Reads the table number from the QR link. |
| `admin.html` | Restaurant staff (login) | Live orders board, menu editor with instant publish and sold-out switches, Sales analytics, table QR codes, restaurant details. |
| `tables.html` | Restaurant staff | Print A6 table cards with QR codes, 4 per A4 sheet. |
| `config.js` | — | Supabase connection (public anon key). Empty = demo mode. |
| `backend.js` | — | Data layer used by every page (live Supabase or demo storage). |
| `supabase/schema.sql` | — | Database: menu, orders, security rules, server-side order pricing. Built from `schema.template.sql` + `menu-data.js` by `node supabase/build-schema.js`. |
| `menu-data.js` | — | Starter menu and offline fallback. |

## How it works (live mode)
- **Guests** scan the table QR, browse, and place orders. The server prices every order from the published menu, refuses sold-out dishes and rate-limits each table. Guests then track their order live (Received, Preparing, Served), see a running bill, and can ask for water, cutlery or the bill.
- **Staff** sign in to `admin.html` (Supabase Auth plus an allowlist in the `staff` table). Orders arrive in real time with a chime. Menu edits go live when you press **Publish changes**, and sold-out switches go live instantly.
- **Security:** the public key can only read the menu and call the three guest functions (`place_order`, `place_request`, `order_status`). Reading orders and editing the menu need a staff login.
- **Adding staff:** create the user under Supabase → Authentication → Users, then run `insert into public.staff (email) values ('name@example.com');` in the SQL Editor.

Leave `config.js` empty to run in **demo mode** (one browser, no backend). See `SETUP-ORDERS.md` to set up a fresh Supabase project.

## Run locally
```
python -m http.server 8000
```
Then open http://localhost:8000/admin.html
