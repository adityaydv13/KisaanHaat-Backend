 const { v4: uuidv4 } = require("uuid");
const { buildXVerify, buildXVerifyForGet }=require("../utils/phonepe");

const {
  PHONEPE_BASE_URL,
  PHONEPE_MERCHANT_ID,
  PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX,
  FRONTEND_URL,
  BACKEND_URL,
} = process.env;

/**
 * Create a payment: returns PhonePe redirect URL
 * Body: { amount }  // in rupees (we’ll convert to paise)
 */
exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const merchantTransactionId = uuidv4().replace(/-/g, "").slice(0, 24); // 24-char id
    const amountInPaise = Math.round(Number(amount) * 100);

    // Redirects
    const redirectUrl = `${FRONTEND_URL}/payment-return?transactionId=${merchantTransactionId}`;
    const callbackUrl = `${BACKEND_URL}/api/pay/callback`; // (optional, server-to-server)

    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: "kisanhaat-user", // any internal user id/alias
      amount: amountInPaise,
      redirectUrl,
      redirectMode: "POST",
      callbackUrl,
      mobileNumber: "9999999999", // optional
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const path = "/pg/v1/pay";
    const xVerify = buildXVerify(base64Payload, path, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX);

    const resp = await axios.post(
      `${PHONEPE_BASE_URL}${path}`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          accept: "application/json",
        },
      }
    );

    // Expecting redirect URL here
    const instrument = resp?.data?.data?.instrumentResponse;
    const redirectUrlFromPhonePe = instrument?.redirectInfo?.url;

    return res.json({
      success: true,
      merchantTransactionId,
      redirectUrl: redirectUrlFromPhonePe,
      raw: resp.data,
    });
  } catch (err) {
    console.error("PhonePe createPayment error:", err?.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: err?.response?.data || err.message,
    });
  }
};

/**
 * Check payment status by transactionId
 * Query: ?transactionId=...
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.query;
    if (!transactionId) return res.status(400).json({ message: "Missing transactionId" });

    const path = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`;
    const xVerify = buildXVerifyForGet(path, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX);

    const resp = await axios.get(`${PHONEPE_BASE_URL}${path}`, {
      headers: {
        "X-VERIFY": xVerify,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
        accept: "application/json",
      },
    });

    // status: "SUCCESS" | "PENDING" | "FAILED"
    return res.json({ success: true, data: resp.data });
  } catch (err) {
    console.error("PhonePe getPaymentStatus error:", err?.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch status",
      error: err?.response?.data || err.message,
    });
  }
};

/**
 * OPTIONAL: Callback (server-to-server) from PhonePe
 * You should verify X-VERIFY here if you want extra security.
 */
exports.phonePeCallback = async (req, res) => {
  try {
    // PhonePe sends data about the transaction. You can log & update DB here.
    // Example structure: req.body.data.merchantTransactionId, req.body.code, etc.
    console.log("PhonePe callback body:", JSON.stringify(req.body, null, 2));

    // Always send 200 OK
    return res.status(200).send("OK");
  } catch (err) {
    return res.status(200).send("OK");
  }
};
