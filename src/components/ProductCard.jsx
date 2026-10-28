import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import JewelArt from "./JewelArt";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../utils/imageUrl";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.stockQty <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
      className="group relative"
    >
      <div className="relative rounded-2xl bg-gradient-to-b from-ivory-deep to-ivory overflow-hidden border border-gold-200/50 card-shine shadow-sm hover:shadow-gold transition-shadow duration-500">
        {isOutOfStock ? (
          <span className="absolute top-3 left-3 z-10 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-body bg-red-800 text-white">
            Out of stock
          </span>
        ) : product.badge && (
          <span
            className={`absolute top-3 left-3 z-10 text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full font-body ${
              product.badge === "Sale"
                ? "bg-maroon-700 text-ivory"
                : product.badge === "New"
                ? "bg-emerald-800 text-ivory"
                : "bg-gold-500 text-maroon-900"
            }`}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product)}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-ivory/80 backdrop-blur flex items-center justify-center hover:bg-ivory transition-colors"
        >
          <Heart size={15} className={wishlisted ? "fill-maroon-700 text-maroon-700" : "text-maroon-900"} />
        </button>

        <Link to={`/product/${product.id}`}>
          <div className="aspect-square flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(233,195,99,0.18),transparent_65%)]">
            {product.image ? (
              <img
                src={resolveImageUrl(product.image)}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-6">
                <JewelArt
                  type={product.categoryType || "necklace"}
                  theme={product.theme}
                  className="w-full h-full max-h-44 group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-700 ease-out drop-shadow-md"
                />
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 pt-1">
          <p className="text-[11px] uppercase tracking-wider text-gold-700/80 font-body mb-1">{product.gemstone}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-display text-lg text-maroon-900 leading-snug hover:text-gold-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mt-1 mb-2">
            <Star size={12} className="fill-gold-500 text-gold-500" />
            <span className="text-xs text-maroon-900/70 font-body">
              {product.rating} ({product.reviews})
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-display text-xl text-maroon-900">₹{product.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-maroon-900/40 line-through font-body">₹{product.mrp.toLocaleString("en-IN")}</span>
            <span className="text-xs text-emerald-800 font-body">{discount}% off</span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-maroon-900 text-ivory text-sm tracking-wide hover:bg-gold-600 hover:text-maroon-950 transition-colors duration-300 font-body disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={15} />
            {isOutOfStock ? "Out of Stock" : "Add to Bag"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
