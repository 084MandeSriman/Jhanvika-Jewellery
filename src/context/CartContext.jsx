import { createContext, useContext, useMemo, useState, useCallback, useEffect, useRef } from "react";
import { CartAPI, WishlistAPI } from "../api/services";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]); // [{product, qty}]
  const [wishlist, setWishlist] = useState([]); // [productId]
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const hydrated = useRef(false);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  // Hydrate cart/wishlist from the backend whenever auth state settles/changes.
  // Guest carts are keyed by a persistent localStorage token (set in api/client.js);
  // once a user logs in, their DB cart (server-side, keyed by user_id) takes over.
  useEffect(() => {
    let cancelled = false;

    CartAPI.list()
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {
        /* backend unreachable — fall back to empty cart rather than breaking the UI */
      });

    if (isAuthenticated) {
      WishlistAPI.list()
        .then((res) => {
          if (!cancelled) setWishlist(res.data);
        })
        .catch(() => {});
    } else {
      setWishlist([]);
    }

    hydrated.current = true;
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  const addToCart = useCallback(
    (product, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + qty } : i));
        }
        return [...prev, { product, qty }];
      });
      showToast(`${product.name} added to bag`);
      CartAPI.add(product.id, qty).catch(() => {
        /* best-effort sync; local state already updated for instant UI feedback */
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    CartAPI.remove(productId).catch(() => {});
  }, []);

  const updateQty = useCallback((productId, qty) => {
    const safeQty = Math.max(1, qty);
    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, qty: safeQty } : i)));
    CartAPI.update(productId, safeQty).catch(() => {});
  }, []);

  const clearCartLocal = useCallback(() => setItems([]), []);

  const toggleWishlist = useCallback(
    (product) => {
      if (!isAuthenticated) {
        showToast("Log in to save items to your wishlist");
        return;
      }
      setWishlist((prev) => {
        const exists = prev.includes(product.id);
        showToast(exists ? "Removed from wishlist" : "Added to wishlist");
        if (exists) {
          WishlistAPI.remove(product.id).catch(() => {});
        } else {
          WishlistAPI.add(product.id).catch(() => {});
        }
        return exists ? prev.filter((id) => id !== product.id) : [...prev, product.id];
      });
    },
    [isAuthenticated, showToast]
  );

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  const value = {
    items,
    wishlist,
    addToCart,
    removeFromCart,
    updateQty,
    clearCartLocal,
    toggleWishlist,
    isWishlisted,
    subtotal,
    count,
    toast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
