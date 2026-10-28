import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Star, Truck, RefreshCcw, ShieldCheck, Minus, Plus, ChevronRight } from "lucide-react";
import { useProduct, useRelatedProducts, useCategories, useProductImages } from "../hooks/useCatalogue";
import { RecentlyViewedAPI } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";
import JewelArt from "../components/JewelArt";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import ProductReviews from "../components/ProductReviews";
import JewellerySpecs from "../components/JewellerySpecs";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(productId);
  const { images } = useProductImages(productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { related } = useRelatedProducts(productId);
  const { categories } = useCategories();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { isAuthenticated } = useAuth();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const viewedProductId = product?.id;

  useEffect(() => {
    setQty(1);
    setActiveImageIndex(0);
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    setRecentlyViewed([]);

    if (isAuthenticated && viewedProductId) {
      RecentlyViewedAPI.track(viewedProductId)
        .then(() => RecentlyViewedAPI.list())
        .then((res) => {
          if (!cancelled) {
            setRecentlyViewed(res.data.filter((item) => item.id !== viewedProductId));
          }
        })
        .catch((error) => {
          console.error("Failed to load recently viewed products", error);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, viewedProductId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 md:px-10 py-24" />;
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-display text-3xl text-maroon-900 mb-4">Piece not found</p>
        <button onClick={() => navigate("/shop")} className="text-gold-600 underline">
          Back to shop
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.category);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.stockQty <= 0;

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-5 md:py-7">
      <Helmet>
        <title>{product.name} — Jhanvika Jewelleries</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
        <link rel="canonical" href={`/product/${product.id}`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description?.slice(0, 155)} />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "INR",
              availability: `https://schema.org/${isOutOfStock ? "OutOfStock" : "InStock"}`,
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviews,
            },
          })}
        </script>
      </Helmet>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-maroon-900/50 font-body mb-5 flex-wrap">
        <Link to="/" className="hover:text-gold-600">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/shop/${product.category}`} className="hover:text-gold-600">{category?.name}</Link>
        <ChevronRight size={12} />
        <span className="text-maroon-900">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-14">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="relative rounded-xl bg-gradient-to-b from-ivory-deep to-ivory border border-gold-200/50 flex items-center justify-center overflow-hidden aspect-[1.28]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(233,195,99,0.22),transparent_65%)]" />
            {product.badge && (
              <span
                className={`absolute top-5 left-5 z-10 text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-body ${
                  product.badge === "Sale" ? "bg-maroon-700 text-ivory" : product.badge === "New" ? "bg-emerald-800 text-ivory" : "bg-gold-500 text-maroon-900"
                }`}
              >
                {product.badge}
              </span>
            )}
            {images.length > 0 ? (
              <img
                src={resolveImageUrl(images[activeImageIndex]?.image_url || images[0].image_url)}
                alt={images[activeImageIndex]?.alt_text || product.name}
                className="w-full h-full object-cover relative z-10"
              />
            ) : (
              <JewelArt type={product.categoryType} theme={product.theme} className="w-full h-full max-w-lg p-6 animate-float drop-shadow-2xl relative z-10" />
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activeImageIndex ? "border-gold-500" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={resolveImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          </motion.div>
          <ProductReviews productId={product.id} compact />
        </div>

        {/* Info side */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-600 font-body mb-2">{product.gemstone} · {product.metal}</p>
          <h1 className="font-display text-3xl md:text-[2rem] text-maroon-900 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-gold-500 text-gold-500" : "text-gold-200"} />
              ))}
            </div>
            <span className="text-sm text-maroon-900/60 font-body">
              {product.rating} · {product.reviews} reviews
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="font-display text-3xl text-maroon-900">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-sm text-maroon-900/40 line-through font-body">₹{product.mrp.toLocaleString("en-IN")}</span>
            <span className="text-sm text-emerald-800 font-body font-medium">{discount}% off</span>
          </div>
          <p className="text-xs text-maroon-900/50 font-body mt-1">Inclusive of all taxes</p>
          <p className={`text-sm font-body mt-1 ${isOutOfStock ? "text-red-700" : "text-emerald-800"}`}>
            {isOutOfStock ? "Out of stock" : `${product.stockQty} in stock`}
          </p>

          <p className="text-maroon-900/70 font-body mt-2 leading-relaxed text-sm">{product.description}</p>

          {/* Quantity + actions */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex items-center border border-gold-300 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-maroon-900 hover:text-gold-600" aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-body text-maroon-900">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stockQty, q + 1))}
                disabled={isOutOfStock || qty >= product.stockQty}
                className="p-3 text-maroon-900 hover:text-gold-600 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={() => addToCart(product, qty)}
              disabled={isOutOfStock}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-maroon-900 text-ivory font-body text-sm tracking-wide hover:bg-gold-600 hover:text-maroon-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={17} />
              Add to Bag
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
              className="w-12 h-12 shrink-0 rounded-full border border-gold-300 flex items-center justify-center hover:bg-gold-100 transition-colors"
            >
              <Heart size={18} className={wishlisted ? "fill-maroon-700 text-maroon-700" : "text-maroon-900"} />
            </button>
          </div>

          <button
            onClick={() => navigate("/cart")}
            disabled={isOutOfStock}
            className="w-full mt-2 py-2.5 rounded-full border border-maroon-900 text-maroon-900 font-body text-sm tracking-wide hover:bg-maroon-900 hover:text-ivory transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy It Now
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gold-200/60">
            {[
              { icon: Truck, label: "Free Shipping" },
              { icon: RefreshCcw, label: "15-Day Exchange" },
              { icon: ShieldCheck, label: "Certified Purity" },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <b.icon className="mx-auto text-gold-600 mb-1.5" size={20} strokeWidth={1.5} />
                <p className="text-[11px] text-maroon-900/60 font-body">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-5">
            <div className="flex gap-6 border-b border-gold-200/60">
              {["details", "shipping"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-body capitalize transition-colors relative ${
                    activeTab === tab ? "text-maroon-900" : "text-maroon-900/40"
                  }`}
                >
                  {tab === "details" ? "Product Details" : "Shipping & Care"}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-gold-500" />
                  )}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {activeTab === "details" ? (
                <motion.ul
                  key="details"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-5 space-y-2.5"
                >
                  {product.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-maroon-900/70 font-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </motion.ul>
              ) : (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-5 space-y-2.5 text-sm text-maroon-900/70 font-body leading-relaxed"
                >
                  <p>Dispatched within 24-48 hours in a signature Jhanvika gift box.</p>
                  <p>Free insured shipping across India on orders above ₹2,999.</p>
                  <p>15-day easy exchange window from date of delivery. Avoid contact with perfume & water to preserve plating.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeTab === "details" && <JewellerySpecs specs={product.specs} />}
        </motion.div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-24">
          <SectionHeading eyebrow="You May Also Love" title="Complete the Look" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {isAuthenticated && recentlyViewed.length > 0 && (
        <div className="mt-24">
          <SectionHeading eyebrow="Your History" title="Recently Viewed" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 md:gap-7">
            {recentlyViewed.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
