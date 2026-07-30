# SAFAR by Grace One — Car Diffuser Website

A simple, static link-in-bio style landing page for SAFAR, Grace One's
premium hanging car diffuser. No backend, no payment gateway — built to be
shared on social platforms and drive orders via WhatsApp for now.

## Before you deploy

Only one thing left to customize in `index.html`:

- Product photos for the SAFAR — Musk card (currently 🖤 emoji placeholder)
- Add more `<article class="card">` entries in the `#products` section as new scents launch

Already set to match the product packaging: brand (Grace One / SAFAR),
Instagram/Facebook (`graceone.in`), support email (`support@graceone.in`),
WhatsApp (`+91 99999 87609`), price (₹499, 10ml), and claims (alcohol-free,
IFRA compliant, lasts up to 30 days).

## Deploy on Vercel (free)

Vercel account: `graceragheshwari-2431`

1. Push this repo to GitHub (already done if you're reading this on the branch).
2. Go to [vercel.com](https://vercel.com) and log in as `graceragheshwari-2431`.
3. Click **Add New → Project**, select this repo (`safar`), and pick the branch with this site.
4. Framework preset: **Other** (it's a static site, no build step needed).
5. Click **Deploy**. You'll get a free `*.vercel.app` URL immediately.

## Connect your domain (GraceOne.in)

1. In the Vercel project, go to **Settings → Domains** and add `graceone.in`.
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
