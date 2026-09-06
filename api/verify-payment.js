// Verifies a Razorpay checkout success callback server-side using the
// documented HMAC SHA256 signature scheme, so a forged client-side "success"
// message can never be trusted on its own.
//
// Requires RAZORPAY_KEY_SECRET (see create-order.js for where it comes from).

const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ error: "Online payment isn't set up yet." });
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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment details." });
    return;
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const givenBuf = Buffer.from(String(razorpay_signature), "utf8");
  const isValid = expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);

  if (!isValid) {
    res.status(400).json({ verified: false, error: "Signature mismatch." });
    return;
  }

  res.status(200).json({ verified: true });
};
