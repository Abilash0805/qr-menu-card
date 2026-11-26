# Turning on live orders (about 10 minutes, free)

Out of the box the site runs in **demo mode**: orders only show up in the same browser where they were placed (open the menu and the admin in two tabs to see it work). To receive orders from every guest's phone, connect a free Supabase database.

## 1. Create the database
1. Sign in at https://supabase.com and click **New project**. The free plan is enough. Pick the region closest to you (Mumbai for India).
2. When it's ready, open **SQL Editor → New query**.
3. Open `supabase-schema.sql` from this folder and change `owner@example.com` to the email you'll use as staff login.
4. Paste the whole file into the editor and click **Run**.

## 2. Create the staff login
1. Go to **Authentication → Users → Add user → Create new user**.
2. Use the same email as in step 1.3, choose a password, and tick **Auto confirm user**.
3. Recommended: go to **Authentication → Sign In / Providers** and turn off **Allow new users to sign up**.

## 3. Connect the site
1. Go to **Project Settings → API** (or **Data API**) and copy the **Project URL** and the **anon / publishable key**.
2. Put them in `config.js`:
   ```js
   window.QRMENU_CONFIG = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseAnonKey: "eyJ..."
   };
   ```
3. Upload `config.js` to the GitHub repo (or push it). The anon key is meant to be public. The database rules only let guests **add** orders, never read or change them.

## 4. Use it
- Open `admin.html` and sign in with the staff login. The Orders tab now says **Live**.
- Scan a table QR with any phone, add dishes and tap **Place order**. It appears on the dashboard within a second, with a chime.
- Move orders through **New → Preparing → Served → Close bill**. Water, bill and cutlery requests show as yellow alerts at the top.

## What this sample doesn't do yet
- Guests can't see the status of their order after sending it.
- No online payment. The bill is settled at the table.
- No spam protection beyond the database's size limits. A busy production setup should add rate limiting.
