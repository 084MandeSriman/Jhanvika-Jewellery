import pool from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function findOrCreateCart({ userId, guestToken }) {
  if (userId) {
    const [rows] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [userId]);
    if (rows.length) return rows[0];
    const [result] = await pool.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
    return { id: result.insertId, user_id: userId };
  }
  const [rows] = await pool.query("SELECT * FROM carts WHERE guest_token = ?", [guestToken]);
  if (rows.length) return rows[0];
  const [result] = await pool.query("INSERT INTO carts (guest_token) VALUES (?)", [guestToken]);
  return { id: result.insertId, guest_token: guestToken };
}

function cartIdentity(req) {
  return {
    userId: req.user?.id || null,
    guestToken: req.user?.id ? null : req.headers["x-guest-token"] || "anonymous",
  };
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(cartIdentity(req));
  const [items] = await pool.query(
    `SELECT ci.quantity, p.*, c.art_type,
       (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) as primary_image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     JOIN categories c ON c.id = p.category_id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );
  res.json({
    success: true,
    data: items.map((i) => ({
      product: {
        id: i.id,
        name: i.name,
        image: i.primary_image || null,
        price: Number(i.price),
        mrp: Number(i.mrp),
        theme: i.theme,
        category: i.category_id,
        categoryType: i.art_type,
        gemstone: i.gemstone,
        metal: i.metal,
      },
      qty: i.quantity,
    })),
  });
});

// POST /api/cart  { productId, qty }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const cart = await findOrCreateCart(cartIdentity(req));
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cart.id, productId, qty]
  );
  res.status(201).json({ success: true });
});

// PATCH /api/cart/:productId  { qty }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { qty } = req.body;
  const cart = await findOrCreateCart(cartIdentity(req));
  await pool.query(`UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`, [
    Math.max(1, qty),
    cart.id,
    req.params.productId,
  ]);
  res.json({ success: true });
});

// DELETE /api/cart/:productId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(cartIdentity(req));
  await pool.query(`DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cart.id, req.params.productId]);
  res.json({ success: true });
});
