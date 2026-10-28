import PDFDocument from "pdfkit";
import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { orderConfirmationEmail } from "../services/templates/index.js";

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JJ-${date}-${rand}`;
}

// POST /api/orders  { addressId, paymentMethod, couponCode }
// Creates an order from the user's current DB cart, snapshots prices, clears the cart.
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod = "cod", couponCode } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [addressRows] = await conn.query("SELECT * FROM addresses WHERE id = ? AND user_id = ?", [addressId, req.user.id]);
    if (addressRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    const [cartRows] = await conn.query("SELECT id FROM carts WHERE user_id = ?", [req.user.id]);
    if (cartRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    const cartId = cartRows[0].id;

    const [items] = await conn.query(
      `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.stock_qty
       FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ?`,
      [cartId]
    );
    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const [coupons] = await conn.query(
        "SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until >= CURDATE())",
        [couponCode]
      );
      if (coupons.length && subtotal >= Number(coupons[0].min_order_value)) {
        const c = coupons[0];
        discountAmount = c.discount_type === "percent" ? Math.round(subtotal * (Number(c.discount_value) / 100)) : Number(c.discount_value);
        couponId = c.id;
      }
    }

    const shippingAmount = subtotal - discountAmount >= 2999 ? 0 : 149;
    const totalAmount = subtotal - discountAmount + shippingAmount;
    const orderNumber = generateOrderNumber();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_number, user_id, address_id, coupon_id, subtotal, discount_amount, shipping_amount, tax_amount, total_amount, payment_method, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'confirmed')`,
      [orderNumber, req.user.id, addressId, couponId, subtotal, discountAmount, shippingAmount, totalAmount, paymentMethod]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.quantity]
      );
      await conn.query(`UPDATE products SET stock_qty = GREATEST(0, stock_qty - ?) WHERE id = ?`, [item.quantity, item.product_id]);
      await conn.query(`INSERT INTO stock_history (product_id, change_qty, reason) VALUES (?, ?, 'order_placed')`, [
        item.product_id,
        -item.quantity,
      ]);
    }

    await conn.query(
      `INSERT INTO payments (order_id, method, status, amount) VALUES (?, ?, ?, ?)`,
      [orderId, paymentMethod, paymentMethod === "cod" ? "pending" : "success", totalAmount]
    );

    if (couponId) {
      await conn.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [couponId]);
    }

    await conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);

    await conn.commit();

    // Fire-and-forget confirmation email — never blocks or fails the order response
    pool.query("SELECT name, email FROM users WHERE id = ?", [req.user.id]).then(([userRows]) => {
      if (userRows[0]) {
        sendEmail({
          to: userRows[0].email,
          subject: `Order Confirmed — ${orderNumber}`,
          html: orderConfirmationEmail(userRows[0].name, {
            orderNumber,
            items: items.map((i) => ({ name: i.name, qty: i.quantity, price: Number(i.price) })),
            total: totalAmount,
          }),
        });
      }
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: { orderId, orderNumber, subtotal, discountAmount, shippingAmount, totalAmount, status: "confirmed" },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/orders
export const listMyOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  const [items] = orders.length
    ? await pool.query(
        `SELECT oi.*,
                p.theme,
                c.art_type AS category_type,
                (SELECT image_url FROM product_images pi
                 WHERE pi.product_id = oi.product_id
                 ORDER BY pi.is_primary DESC, pi.sort_order ASC
                 LIMIT 1) AS primary_image
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         LEFT JOIN categories c ON c.id = p.category_id
         WHERE oi.order_id IN (${orders.map(() => "?").join(",")})`,
        orders.map((o) => o.id)
      )
    : [[]];
  res.json({
    success: true,
    data: orders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.order_status,
      total: Number(o.total_amount),
      createdAt: o.created_at,
      items: items.filter((i) => i.order_id === o.id).map((i) => ({
        productId: i.product_id,
        name: i.product_name,
        price: Number(i.unit_price),
        qty: i.quantity,
        image: i.primary_image || null,
        theme: i.theme || "gold",
        categoryType: i.category_type || "necklace",
      })),
    })),
  });
});

// GET /api/orders/:id
export const getMyOrder = asyncHandler(async (req, res) => {
  const [orders] = await pool.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (orders.length === 0) return res.status(404).json({ success: false, message: "Order not found" });
  const [items] = await pool.query(
    `SELECT oi.*,
            p.theme,
            c.art_type AS category_type,
            (SELECT rr.status FROM return_requests rr
             WHERE rr.order_item_id = oi.id
             ORDER BY rr.created_at DESC LIMIT 1) AS return_status,
            (SELECT image_url FROM product_images pi
             WHERE pi.product_id = oi.product_id
             ORDER BY pi.is_primary DESC, pi.sort_order ASC
             LIMIT 1) AS primary_image
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE oi.order_id = ?`,
    [req.params.id]
  );
  const [address] = await pool.query("SELECT * FROM addresses WHERE id = ?", [orders[0].address_id]);
  res.json({
    success: true,
    data: {
      id: orders[0].id,
      orderNumber: orders[0].order_number,
      status: orders[0].order_status,
      subtotal: Number(orders[0].subtotal),
      discount: Number(orders[0].discount_amount),
      shipping: Number(orders[0].shipping_amount),
      total: Number(orders[0].total_amount),
      paymentMethod: orders[0].payment_method,
      createdAt: orders[0].created_at,
      address: address[0] || null,
      items: items.map((i) => ({
        orderItemId: i.id,
        productId: i.product_id,
        name: i.product_name,
        price: Number(i.unit_price),
        qty: i.quantity,
        image: i.primary_image || null,
        theme: i.theme || "gold",
        categoryType: i.category_type || "necklace",
        returnStatus: i.return_status || null,
      })),
    },
  });
});

// GET /api/orders/:id/invoice — generates and streams a PDF invoice
export const downloadInvoice = asyncHandler(async (req, res) => {
  const [orders] = await pool.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (orders.length === 0) return res.status(404).json({ success: false, message: "Order not found" });
  const order = orders[0];

  const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.id]);
  const [addressRows] = await pool.query("SELECT * FROM addresses WHERE id = ?", [order.address_id]);
  const address = addressRows[0];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.order_number}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).fillColor("#5c1f18").text("JHANVIKA JEWELLERIES", { align: "center" });
  doc.fontSize(9).fillColor("#8a7355").text("14 Kalasha Marg, Jaipur, Rajasthan 302001", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(14).fillColor("#20140f").text(`Invoice — ${order.order_number}`);
  doc.fontSize(9).fillColor("#666").text(`Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`);
  doc.moveDown(0.5);

  if (address) {
    doc.fontSize(10).fillColor("#20140f").text("Bill To:", { underline: true });
    doc.fontSize(9).fillColor("#444").text(`${address.full_name}\n${address.line1}${address.line2 ? ", " + address.line2 : ""}\n${address.city}, ${address.state} - ${address.pincode}\nPhone: ${address.phone}`);
  }
  doc.moveDown(1);

  // Table header
  const tableTop = doc.y;
  doc.fontSize(9).fillColor("#5c1f18");
  doc.text("Item", 50, tableTop, { width: 250 });
  doc.text("Qty", 300, tableTop, { width: 60, align: "right" });
  doc.text("Price", 370, tableTop, { width: 80, align: "right" });
  doc.text("Total", 460, tableTop, { width: 80, align: "right" });
  doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).strokeColor("#e9c363").stroke();

  let y = tableTop + 22;
  doc.fillColor("#20140f");
  for (const item of items) {
    doc.fontSize(9);
    doc.text(item.product_name, 50, y, { width: 250 });
    doc.text(String(item.quantity), 300, y, { width: 60, align: "right" });
    doc.text(`₹${Number(item.unit_price).toLocaleString("en-IN")}`, 370, y, { width: 80, align: "right" });
    doc.text(`₹${(item.quantity * Number(item.unit_price)).toLocaleString("en-IN")}`, 460, y, { width: 80, align: "right" });
    y += 20;
  }

  doc.moveTo(50, y + 5).lineTo(540, y + 5).strokeColor("#e9c363").stroke();
  y += 15;
  const totals = [
    ["Subtotal", order.subtotal],
    ["Discount", -order.discount_amount],
    ["Shipping", order.shipping_amount],
    ["Tax", order.tax_amount],
  ];
  for (const [label, val] of totals) {
    doc.fontSize(9).fillColor("#666").text(label, 370, y, { width: 80, align: "right" });
    doc.fillColor("#20140f").text(`₹${Number(val).toLocaleString("en-IN")}`, 460, y, { width: 80, align: "right" });
    y += 16;
  }
  doc.fontSize(12).fillColor("#5c1f18").text("Total", 370, y, { width: 80, align: "right" });
  doc.text(`₹${Number(order.total_amount).toLocaleString("en-IN")}`, 460, y, { width: 80, align: "right" });

  doc.moveDown(3);
  doc.fontSize(8).fillColor("#999").text("Thank you for shopping with Jhanvika Jewelleries.", { align: "center" });

  doc.end();
});
