const crypto = require("crypto");
const razorpay = require("../utils/razorpay");

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Razorpay works in paise
      currency,
      receipt: receipt || "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err) {
    console.error("Razorpay createOrder error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Verify payment (after frontend returns with payment_id + signature)
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }

    // Payment is verified → update DB (Request/Machine/User)
    // Example:
    // await Request.findOneAndUpdate({ orderId }, { status: "PAID", paymentId });

    return res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    console.error("Razorpay verifyPayment error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};
