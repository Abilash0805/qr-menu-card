# QR Menu Card — sample

A guest menu that opens when a table's QR code is scanned, an admin page for the restaurant, and printable table QR cards.

**Live:** https://abilash0805.github.io/qr-menu-card/

| Page | Who it's for | What it does |
|---|---|---|
| `index.html` (`/?t=7`) | Guests | The menu. Reads the table number from the QR link. |
| `admin.html` | Restaurant staff | **Orders dashboard** (live), edit dishes, prices and sections, mark dishes sold out, change restaurant details, view or download each table's QR code. |
| `tables.html` | Restaurant staff | Print A6 table cards with QR codes, 4 per A4 sheet. |
| `menu-data.js` | — | The published menu. Everything reads from this file. |
| `config.js`, `orders.js`, `supabase-schema.sql` | — | Ordering backend. See **SETUP-ORDERS.md** to switch from demo mode to live orders. |

## Orders
Guests add dishes and tap **Place order**; waiter requests (water, bill, cutlery) go through the **Server** button. Both appear in the admin's **Orders** tab with a chime.

- **Demo mode** (default): works in a single browser. Open the menu and the admin in two tabs.
- **Live mode**: orders from every phone. Takes about 10 minutes with a free Supabase project, see `SETUP-ORDERS.md`.

## How editing works
This is a static site with no server or database:
1. Edits in `admin.html` are saved in **that browser only**. "Preview menu" shows them with a banner so you can check before going live.
2. **Publish…** downloads a new `menu-data.js`. Upload it to the GitHub repo (Add file → Upload files → Commit) and the live menu updates in about a minute.
3. QR codes never change, so you never reprint the cards.

The admin page has no login. That's harmless here, because a visitor's edits only stay in their own browser, but for a real deployment menu edits should also move into the database so they go live instantly.

## Run locally
```
python -m http.server 8000
```
Then open http://localhost:8000/admin.html
