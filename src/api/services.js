import api from "./client";
import adminApi from "./adminClient";

export const ProductAPI = {
  list: (params = {}) => api.get("/products", { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data),
  related: (id) => api.get(`/products/${id}/related`).then((r) => r.data),
  images: (id) => api.get(`/products/${id}/images`).then((r) => r.data),
};

export const CategoryAPI = {
  list: () => api.get("/categories").then((r) => r.data),
};

export const ContentAPI = {
  testimonials: () => api.get("/testimonials").then((r) => r.data),
  heroSlides: () => api.get("/hero-slides").then((r) => r.data),
};

export const AuthAPI = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

export const WishlistAPI = {
  list: () => api.get("/wishlist").then((r) => r.data),
  add: (productId) => api.post("/wishlist", { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const CartAPI = {
  list: () => api.get("/cart").then((r) => r.data),
  add: (productId, qty = 1) => api.post("/cart", { productId, qty }).then((r) => r.data),
  update: (productId, qty) => api.patch(`/cart/${productId}`, { qty }).then((r) => r.data),
  remove: (productId) => api.delete(`/cart/${productId}`).then((r) => r.data),
};

export const AddressAPI = {
  list: () => api.get("/addresses").then((r) => r.data),
  create: (payload) => api.post("/addresses", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/addresses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/addresses/${id}`).then((r) => r.data),
};

export const OrderAPI = {
  create: (payload) => api.post("/orders", payload).then((r) => r.data),
  list: () => api.get("/orders").then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  downloadInvoice: async (id, orderNumber) => {
    const res = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${orderNumber}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};

export const CouponAPI = {
  validate: (code, subtotal) => api.post("/coupons/validate", { code, subtotal }).then((r) => r.data),
};

// ---- Admin ----
export const AdminAuthAPI = {
  login: (payload) => adminApi.post("/admin/login", payload).then((r) => r.data),
};

export const AdminAPI = {
  dashboard: () => adminApi.get("/admin/dashboard").then((r) => r.data),

  products: {
    list: () => adminApi.get("/admin/products").then((r) => r.data),
    create: (payload) => adminApi.post("/admin/products", payload).then((r) => r.data),
    update: (id, payload) => adminApi.patch(`/admin/products/${id}`, payload).then((r) => r.data),
    remove: (id) => adminApi.delete(`/admin/products/${id}`).then((r) => r.data),
  },
  categories: {
    create: (payload) => adminApi.post("/admin/categories", payload).then((r) => r.data),
    update: (id, payload) => adminApi.patch(`/admin/categories/${id}`, payload).then((r) => r.data),
    uploadImage: (id, formData) => adminApi.post(`/admin/categories/${id}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
    remove: (id) => adminApi.delete(`/admin/categories/${id}`).then((r) => r.data),
  },
  heroSlides: {
    list: () => adminApi.get("/admin/hero-slides").then((r) => r.data),
    create: (payload) => adminApi.post("/admin/hero-slides", payload).then((r) => r.data),
    update: (id, payload) => adminApi.patch(`/admin/hero-slides/${id}`, payload).then((r) => r.data),
    remove: (id) => adminApi.delete(`/admin/hero-slides/${id}`).then((r) => r.data),
  },
  testimonials: {
    list: () => adminApi.get("/admin/testimonials").then((r) => r.data),
    create: (payload) => adminApi.post("/admin/testimonials", payload).then((r) => r.data),
    update: (id, payload) => adminApi.patch(`/admin/testimonials/${id}`, payload).then((r) => r.data),
    remove: (id) => adminApi.delete(`/admin/testimonials/${id}`).then((r) => r.data),
  },
  coupons: {
    list: () => adminApi.get("/admin/coupons").then((r) => r.data),
    create: (payload) => adminApi.post("/admin/coupons", payload).then((r) => r.data),
    update: (id, payload) => adminApi.patch(`/admin/coupons/${id}`, payload).then((r) => r.data),
    remove: (id) => adminApi.delete(`/admin/coupons/${id}`).then((r) => r.data),
  },
  orders: {
    list: (status) => adminApi.get("/admin/orders", { params: status ? { status } : {} }).then((r) => r.data),
    updateStatus: (id, status) => adminApi.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
  },
};

export const ReviewAPI = {
  list: (productId) => api.get(`/products/${productId}/reviews`).then((r) => r.data),
  create: (productId, payload) => api.post(`/products/${productId}/reviews`, payload).then((r) => r.data),
  update: (reviewId, payload) => api.patch(`/reviews/${reviewId}`, payload).then((r) => r.data),
  remove: (reviewId) => api.delete(`/reviews/${reviewId}`).then((r) => r.data),
};

export const SearchAPI = {
  autocomplete: (q) => api.get("/search/autocomplete", { params: { q } }).then((r) => r.data),
  trending: () => api.get("/search/trending").then((r) => r.data),
  popularProducts: () => api.get("/search/popular-products").then((r) => r.data),
  history: () => api.get("/search/history").then((r) => r.data),
  track: (query, resultCount) => api.post("/search/track", { query, resultCount }).then((r) => r.data),
};

export const RecentlyViewedAPI = {
  track: (productId) => api.post("/recently-viewed", { productId }).then((r) => r.data),
  list: () => api.get("/recently-viewed").then((r) => r.data),
};

export const ServiceRequestAPI = {
  create: (payload) => api.post("/services/request", payload).then((r) => r.data),
};

export const ReturnAPI = {
  create: (payload) => api.post("/returns", payload).then((r) => r.data),
  list: () => api.get("/returns").then((r) => r.data),
};

export const NotificationAPI = {
  list: () => api.get("/notifications").then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};

export const WishlistShareAPI = {
  getLink: () => api.get("/wishlist/share").then((r) => r.data),
  getPublic: (token) => api.get(`/wishlist/public/${token}`).then((r) => r.data),
};

export const PaymentAPI = {
  createRazorpayOrder: (amount, receipt) => api.post("/payments/razorpay/create-order", { amount, receipt }).then((r) => r.data),
  verifyRazorpayPayment: (payload) => api.post("/payments/razorpay/verify", payload).then((r) => r.data),
};

// ---- Admin additions ----
AdminAPI.reviews = {
  list: (status) => adminApi.get("/admin/reviews", { params: status ? { status } : {} }).then((r) => r.data),
  moderate: (id, status, adminNote) => adminApi.patch(`/admin/reviews/${id}/moderate`, { status, adminNote }).then((r) => r.data),
};

AdminAPI.serviceRequests = {
  list: () => adminApi.get("/admin/service-requests").then((r) => r.data),
  updateStatus: (id, status) => adminApi.patch(`/admin/service-requests/${id}`, { status }).then((r) => r.data),
};

AdminAPI.returns = {
  list: () => adminApi.get("/admin/returns").then((r) => r.data),
  updateStatus: (id, status) => adminApi.patch(`/admin/returns/${id}`, { status }).then((r) => r.data),
};

AdminAPI.analytics = {
  revenue: (days) => adminApi.get("/admin/analytics/revenue", { params: { days } }).then((r) => r.data),
  bestSellers: (limit) => adminApi.get("/admin/analytics/best-sellers", { params: { limit } }).then((r) => r.data),
  topCategories: () => adminApi.get("/admin/analytics/top-categories").then((r) => r.data),
  monthly: (months) => adminApi.get("/admin/analytics/monthly", { params: { months } }).then((r) => r.data),
  summary: () => adminApi.get("/admin/analytics/summary").then((r) => r.data),
};

AdminAPI.inventory = {
  purchase: (payload) => adminApi.post("/admin/inventory/purchase", payload).then((r) => r.data),
  adjust: (payload) => adminApi.post("/admin/inventory/adjust", payload).then((r) => r.data),
  bulkUpdate: (updates) => adminApi.patch("/admin/inventory/bulk", { updates }).then((r) => r.data),
  lowStock: (threshold) => adminApi.get("/admin/inventory/low-stock", { params: { threshold } }).then((r) => r.data),
  outOfStock: () => adminApi.get("/admin/inventory/out-of-stock").then((r) => r.data),
  history: (productId) => adminApi.get(`/admin/inventory/history/${productId}`).then((r) => r.data),
};

AdminAPI.productImages = {
  upload: (productId, formData) =>
    adminApi.post(`/admin/products/${productId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  reorder: (productId, order) => adminApi.patch(`/admin/products/${productId}/images/reorder`, { order }).then((r) => r.data),
  setPrimary: (productId, imageId) => adminApi.patch(`/admin/products/${productId}/images/${imageId}/primary`).then((r) => r.data),
  remove: (productId, imageId) => adminApi.delete(`/admin/products/${productId}/images/${imageId}`).then((r) => r.data),
};

AdminAPI.payments = {
  transactions: () => adminApi.get("/payments/transactions").then((r) => r.data),
  refund: (orderId, amount) => adminApi.post(`/payments/razorpay/refund/${orderId}`, amount ? { amount } : {}).then((r) => r.data),
};
