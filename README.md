# SAFAR by Grace One — Car Diffuser Website

A static site (no build tools) for SAFAR, Grace One's premium hanging car
diffuser, covering all 5 scents (Musk, Lavender, Sandalwood, Vanilla,
Jasmine). Customers can pay online (cards, UPI, netbanking, wallets, EMI via
Razorpay) directly on each product page, or order over WhatsApp instead —
WhatsApp stays as a fallback if online checkout isn't set up or someone
prefers to order by chat.

Brand details already wired in: Grace One / SAFAR, Instagram/Facebook
(`graceone.in`), support email (`support@graceone.in`), WhatsApp
(`+91 99999 87609`), price (₹499, 10ml), and claims (alcohol-free, IFRA
compliant, lasts up to 45 days).

## Payment gateway (Razorpay)

Online checkout is implemented via two Vercel serverless functions
(`api/create-order.js` and `api/verify-payment.js`) — plain Node.js, no
dependencies, no build step. The order amount is always computed
server-side from a fixed price list, and every successful payment is
verified server-side via HMAC signature before it's shown as confirmed, so
nothing here trusts the browser for money-related decisions.

To make it live:

1. In the [Razorpay Dashboard](https://dashboard.razorpay.com), go to
   **Settings → API Keys** and generate a **Live** Key ID and Key Secret
   (make sure KYC is approved and your PNB current account is linked under
   **Settings → Account & Settings → Linked Accounts / Bank Details** first).
2. In the Vercel project, go to **Settings → Environment Variables** and add:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Redeploy. Until these are set, the "Buy Now" button will show a friendly
   error asking the customer to order via WhatsApp instead — nothing breaks.

Orders themselves aren't stored in a database; Razorpay's dashboard is the
source of truth for payments (each order carries the customer's name, phone,
address and pincode in its **Notes**), and the customer is also prompted to
send the same shipping details to you on WhatsApp right after paying, so you
get a real-time heads-up without needing a backend.

## Before you deploy

- Add more `<article class="card">` entries in the `#products` section (and
  a matching `<scent>.html` page) as new scents launch.

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
