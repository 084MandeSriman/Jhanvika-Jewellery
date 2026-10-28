import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Code-split: the admin panel bundle is only fetched when someone actually
// visits /admin, so regular storefront visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp"));

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function StorefrontRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/shop/:categoryId" element={<PageWrapper><Shop /></PageWrapper>} />
        <Route path="/product/:productId" element={<PageWrapper><ProductDetail /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route
          path="/account/orders/:orderId"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/account"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route
          path="/checkout"
          element={
            <PageWrapper>
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            </PageWrapper>
          }
        />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function Storefront() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-ivory">
          <Navbar />
          <main className="flex-1">
            <StorefrontRoutes />
          </main>
          <Footer />
          <Toast />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

// Top-level split: /admin/* renders a completely separate app (own layout,
// own auth, no storefront Navbar/Footer). Everything else is the storefront,
// whose UI is untouched by any of this.
export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="min-h-screen bg-maroon-900" />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<Storefront />} />
    </Routes>
  );
}
