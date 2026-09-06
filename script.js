document.getElementById("year").textContent = new Date().getFullYear();

(function () {
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ZOOM_FACTOR = 2.4;

  document.querySelectorAll(".product-gallery").forEach((gallery) => {
    const mainWrap = gallery.querySelector(".gallery-main");
    const mainImg = gallery.querySelector(".gallery-main-img");
    const pane = gallery.querySelector(".gallery-zoom-pane");
    const thumbs = gallery.querySelectorAll(".gallery-thumb");

    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbs.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        mainImg.src = thumb.dataset.full;
        pane.style.backgroundImage = `url(${thumb.dataset.full})`;
      });
    });

    if (!canHover || !mainWrap || !pane) return;

    pane.style.backgroundImage = `url(${mainImg.src})`;

    mainWrap.addEventListener("mouseenter", () => {
      mainWrap.classList.add("zoom-active");
    });

    mainWrap.addEventListener("mouseleave", () => {
      mainWrap.classList.remove("zoom-active");
    });

    mainWrap.addEventListener("mousemove", (event) => {
      const rect = mainImg.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pane.style.backgroundSize = `${rect.width * ZOOM_FACTOR}px ${rect.height * ZOOM_FACTOR}px`;
      pane.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
    });
  });
})();

// --- Buy Now: Razorpay checkout (cards, UPI, netbanking, wallets, EMI) ---
// WhatsApp ordering stays alongside this as a fallback for anyone who'd
// rather skip online payment, or if the gateway isn't reachable.
(function () {
  const buyBtn = document.querySelector("[data-buy-now]");
  const form = document.getElementById("checkout-form");
  const status = document.getElementById("checkout-status");
  if (!buyBtn || !form || !status) return;

  const scent = buyBtn.dataset.scent || "";
  const waPhone = buyBtn.dataset.waPhone || "";
  const submitBtn = form.querySelector('button[type="submit"]');

  buyBtn.addEventListener("click", () => {
    form.hidden = !form.hidden;
    buyBtn.setAttribute("aria-expanded", String(!form.hidden));
    if (!form.hidden) form.querySelector("input")?.focus();
  });

  function setStatus(message, variant) {
    status.hidden = !message;
    status.textContent = message || "";
    status.className = "checkout-status" + (variant ? ` checkout-status--${variant}` : "");
  }

  function showSuccess(paymentId, waLink) {
    status.hidden = false;
    status.className = "checkout-status checkout-status--success";
    status.textContent = "";
    const p = document.createElement("p");
    p.textContent = `Payment successful — order confirmed (Payment ID: ${paymentId}). Please send us your order details on WhatsApp so we can confirm delivery.`;
    const a = document.createElement("a");
    a.className = "btn btn-small btn-primary";
    a.href = waLink;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Send Order Details on WhatsApp";
    status.appendChild(p);
    status.appendChild(a);
  }

  function buildWaLink(order) {
    const msg =
      `New PAID order via website!\n` +
      `Scent: SAFAR ${order.scent}\n` +
      `Qty: ${order.quantity}\n` +
      `Name: ${order.name}\n` +
      `Phone: ${order.phone}\n` +
      `Address: ${order.address} - ${order.pincode}\n` +
      `Payment ID: ${order.paymentId}`;
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (typeof Razorpay === "undefined") {
      setStatus("Online checkout isn't available right now — please order via WhatsApp instead.", "error");
      return;
    }

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const address = (data.get("address") || "").toString().trim();
    const pincode = (data.get("pincode") || "").toString().trim();
    let quantity = parseInt(data.get("quantity"), 10);
    if (!Number.isInteger(quantity) || quantity < 1) quantity = 1;

    if (!name || !phone || !address || !pincode) {
      setStatus("Please fill in all required fields.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Preparing secure checkout…";
    setStatus("Preparing secure checkout…", "loading");

    try {
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scent: scent.toLowerCase(), quantity, name, phone, address, pincode }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Could not start checkout.");

      const rzp = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Grace One — SAFAR",
        description: `SAFAR ${scent} (x${quantity})`,
        order_id: order.orderId,
        prefill: { name, contact: phone, email: email || undefined },
        notes: { scent, quantity: String(quantity), address, pincode },
        theme: { color: "#c96f39" },
        handler: async (response) => {
          setStatus("Verifying payment…", "loading");
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verify = await verifyRes.json();
            if (verify.verified) {
              form.hidden = true;
              showSuccess(
                response.razorpay_payment_id,
                buildWaLink({ scent, quantity, name, phone, address, pincode, paymentId: response.razorpay_payment_id })
              );
            } else {
              setStatus("We couldn't verify this payment. Please message us on WhatsApp with your payment ID so we can check.", "error");
            }
          } catch (err) {
            setStatus("Payment went through, but we couldn't confirm it automatically. Please message us on WhatsApp with your payment ID.", "error");
          }
        },
        modal: {
          ondismiss: () => {
            setStatus("Checkout closed — you can also order directly via WhatsApp below.", "");
            submitBtn.disabled = false;
            submitBtn.textContent = "Proceed to Pay";
          },
        },
      });

      rzp.on("payment.failed", (resp) => {
        setStatus(`Payment failed: ${resp.error?.description || "please try again or order via WhatsApp."}`, "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Proceed to Pay";
      });

      rzp.open();
      submitBtn.disabled = false;
      submitBtn.textContent = "Proceed to Pay";
    } catch (err) {
      setStatus(err.message || "Something went wrong. Please try again or order via WhatsApp.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Proceed to Pay";
    }
  });
})();
