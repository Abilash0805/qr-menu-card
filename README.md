# QR Menu Card — sample

A guest-facing digital menu plus printable table QR cards, for a fictional restaurant ("Kaveri" at Hotel Aranya, Fort Kochi).

| File | What it is |
|---|---|
| `index.html` | The menu guests see after scanning. Reads the table number from the link (`?t=7`). |
| `tables.html` | Generates A6 table cards (4 per A4) with a QR code per table. Print from the browser. |
| `menu-data.js` | All restaurant details, sections, dishes and prices. Edit this one file to rebrand. |

## Run it

```
python -m http.server 8000
```

- Menu: http://localhost:8000/?t=7
- Table cards: http://localhost:8000/tables.html

**Test on a phone:** keep the phone on the same Wi-Fi, open `tables.html`, and change "Menu address" to `http://<this-PC's-IP>:8000/` (run `ipconfig` to find it). Then scan a card on screen. Windows may ask you to allow Python through the firewall.

**For real tables:** host the folder somewhere public (Netlify Drop, Vercel, GitHub Pages), put that address into "Menu address" and print.

## Guest menu features
- Section tabs that follow your scroll, search, and a veg-only filter
- Indian veg / egg / non-veg markers, heat level, allergens, Chef's pick and Signature tags
- Tap a dish for details and add it to a personal list with an estimated total including GST (this is not an order; guests show it to the server)
- "Server" button for water, the bill, cutlery or a call. **In this sample it only shows a confirmation.** Connecting it to staff needs a small backend.
- Follows the phone's light/dark setting
