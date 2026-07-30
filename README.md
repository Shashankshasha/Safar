# Grace — Car Diffuser Website

A simple, static link-in-bio style landing page for the Grace car diffuser
brand. No backend, no payment gateway — built to be shared on social
platforms and drive orders via WhatsApp for now.

## Before you deploy

Edit `index.html` and replace these placeholders:

- `91XXXXXXXXXX` (two spots) → your real WhatsApp Business number, country code first, no `+` or spaces (e.g. `919876543210`)
- `YOUR_HANDLE` → your Instagram handle
- `YOUR_PAGE` → your Facebook page
- `hello@grace.in` → your real contact email
- Product names, scents, and prices in the `#products` section
- Emoji placeholders (🌸 🌲 🍋 ✨) → real product photos once you have them

## Deploy on Vercel (free)

1. Push this repo to GitHub (already done if you're reading this on the branch).
2. Go to [vercel.com](https://vercel.com) and sign up/log in with GitHub.
3. Click **Add New → Project**, select this repo.
4. Framework preset: **Other** (it's a static site, no build step needed).
5. Click **Deploy**. You'll get a free `*.vercel.app` URL immediately.

## Connect your domain (grace.in)

1. In the Vercel project, go to **Settings → Domains** and add `grace.in`.
2. Vercel will show DNS records (usually an `A` record or `CNAME`) to add at your domain registrar.
3. Update those records in your registrar's DNS settings.
4. Wait for DNS propagation (usually minutes to a few hours) — Vercel issues a free SSL certificate automatically.

## Local preview

No build tools required. Just open `index.html` in a browser, or run a
simple local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
