// Creates a Razorpay order server-side. The amount is always computed here
// from a fixed price list — an amount sent by the client is never trusted,
// so a tampered request can't buy at a different price.
//
// Requires these Vercel environment variables (Project Settings → Environment
// Variables), taken from the Razorpay Dashboard → Settings → API Keys:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET

const PRICE_PAISE = 49900; // ₹499.00 — same price across all 5 SAFAR scents
const VALID_SCENTS = ["musk", "lavender", "sandalwood", "vanilla", "jasmine"];
const MAX_QUANTITY = 10;
const MAX_FIELD_LENGTH = 300;

function clean(value) {
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD_LENGTH) : "";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    res.status(500).json({ error: "Online payment isn't set up yet — please order via WhatsApp instead." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const scent = String(body.scent || "").toLowerCase();
  if (!VALID_SCENTS.includes(scent)) {
    res.status(400).json({ error: "Unknown scent." });
    return;
  }

  let quantity = parseInt(body.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    quantity = 1;
  }

  const name = clean(body.name);
  const phone = clean(body.phone);
  const address = clean(body.address);
  const pincode = clean(body.pincode);

  const amount = PRICE_PAISE * quantity;

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `safar_${scent}_${Date.now()}`,
        notes: { scent, quantity: String(quantity), name, phone, address, pincode },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: data?.error?.description || "Could not create order." });
      return;
    }

    res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not reach the payment gateway. Please try again or order via WhatsApp." });
  }
};
