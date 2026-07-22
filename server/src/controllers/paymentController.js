import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function getClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env (from your Razorpay dashboard) to enable real payments."
    );
    err.status = 503;
    throw err;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

// POST /api/payments/razorpay/create-order  { amount, orderId }
// Creates a Razorpay order for the given amount (in rupees — converted to paise here).
// This is called from the checkout page BEFORE placing the local order, so the
// Razorpay checkout widget has something to attach to.
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, receipt } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Valid amount is required" });

  const client = getClient();
  const rzpOrder = await client.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: receipt || `receipt_${Date.now()}`,
  });

  res.json({
    success: true,
    data: {
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose — this is the public key
    },
  });
});

// POST /api/payments/razorpay/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId }
// Verifies the payment signature Razorpay's checkout.js returns after a successful
// payment, then records the transaction against our local order.
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing Razorpay verification fields" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment verification failed — signature mismatch" });
  }

  if (localOrderId) {
    await pool.query(
      `UPDATE payments SET status = 'success', gateway = 'razorpay', gateway_order_id = ?, gateway_payment_id = ?, gateway_signature = ?
       WHERE order_id = ?`,
      [razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId]
    );
    await pool.query(`UPDATE orders SET order_status = 'confirmed' WHERE id = ?`, [localOrderId]);
  }

  res.json({ success: true, message: "Payment verified successfully" });
});

// POST /api/payments/razorpay/webhook
// Configure this URL in your Razorpay dashboard (Settings → Webhooks) so payment
// events are recorded even if the customer closes the browser before the
// client-side verify call completes. Requires RAZORPAY_WEBHOOK_SECRET in .env.
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set — ignoring for safety.");
    return res.status(503).json({ success: false, message: "Webhook secret not configured" });
  }

  const expected = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  if (expected !== signature) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  const event = req.body.event;
  const payment = req.body.payload?.payment?.entity;

  if (event === "payment.captured" && payment) {
    await pool.query(
      `UPDATE payments SET status = 'success', gateway_payment_id = ? WHERE gateway_order_id = ?`,
      [payment.id, payment.order_id]
    );
  } else if (event === "payment.failed" && payment) {
    await pool.query(`UPDATE payments SET status = 'failed', gateway_payment_id = ? WHERE gateway_order_id = ?`, [
      payment.id,
      payment.order_id,
    ]);
  }

  res.json({ success: true });
});

// POST /api/payments/razorpay/refund/:orderId  (admin only) { amount? }
// Full refund if amount omitted, partial refund otherwise.
export const refundPayment = asyncHandler(async (req, res) => {
  const client = getClient();
  const [rows] = await pool.query("SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1", [req.params.orderId]);
  if (rows.length === 0 || !rows[0].gateway_payment_id) {
    return res.status(400).json({ success: false, message: "No captured payment found for this order" });
  }

  const { amount } = req.body;
  const refund = await client.payments.refund(rows[0].gateway_payment_id, amount ? { amount: Math.round(amount * 100) } : {});

  await pool.query(`UPDATE payments SET status = 'refunded', refund_id = ?, refund_amount = ? WHERE id = ?`, [
    refund.id,
    amount || rows[0].amount,
    rows[0].id,
  ]);
  await pool.query(`UPDATE orders SET order_status = 'returned' WHERE id = ?`, [req.params.orderId]);

  res.json({ success: true, data: { refundId: refund.id, status: refund.status } });
});

// GET /api/payments/transactions  (admin) — full transaction history
export const listTransactions = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, o.order_number, u.name as customer_name, u.email as customer_email
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     JOIN users u ON u.id = o.user_id
     ORDER BY p.created_at DESC`
  );
  res.json({ success: true, data: rows });
});
