import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import JewelArt from "../components/JewelArt";
import { resolveImageUrl } from "../utils/imageUrl";

export default function Cart() {
  const { items, removeFromCart, updateQty, subtotal } = useCart();

  const shipping = subtotal >= 2999 || subtotal === 0 ? 0 : 149;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center">
        <ShoppingBag className="mx-auto text-gold-400 mb-5" size={48} strokeWidth={1.2} />
        <h1 className="font-display text-3xl text-maroon-900 mb-3">Your bag is empty</h1>

        <p className="text-maroon-900/60 font-body mb-8">Looks like you haven't added any pieces yet. Let's fix that.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-maroon-900 text-ivory px-7 py-3 rounded-full font-body text-sm hover:bg-gold-600 hover:text-maroon-950 transition-colors">
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-14">
      <h1 className="font-display text-2xl md:text-4xl text-maroon-900 mb-6 md:mb-8">Your Bag ({items.length})</h1>

      <div className="grid md:grid-cols-3 gap-6 md:gap-10">
        <div className="md:col-span-2 space-y-3 md:space-y-4">
          <AnimatePresence>
            {items.map(({ product, qty }) => {
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-3 sm:gap-4 md:gap-6 bg-ivory-deep/60 border border-gold-200/50 rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5"
                >
                  <Link to={`/product/${product.id}`} className="w-[70px] h-[70px] sm:w-20 sm:h-20 md:w-28 md:h-28 shrink-0 rounded-lg md:rounded-xl bg-ivory overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img src={resolveImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full p-2 flex items-center justify-center">
                        <JewelArt type={product.categoryType} theme={product.theme} className="w-full h-full" animated={false} />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-display text-base sm:text-lg md:text-xl text-maroon-900 leading-snug line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-[10px] sm:text-xs text-maroon-900/50 font-body mt-0.5 line-clamp-1">{product.gemstone} · {product.metal}</p>
                    <div className="flex items-center justify-between mt-2 sm:mt-3 flex-wrap gap-2">
                      <div className="flex items-center border border-gold-300 rounded-full">
                        <button onClick={() => updateQty(product.id, qty - 1)} className="p-1.5 sm:p-2 text-maroon-900 hover:text-gold-600" aria-label={`Decrease quantity of ${product.name}`}>
                          <Minus size={13} />
                        </button>
                        <span className="w-6 sm:w-7 text-center text-xs sm:text-sm font-body text-maroon-900">{qty}</span>
                        <button onClick={() => updateQty(product.id, qty + 1)} className="p-1.5 sm:p-2 text-maroon-900 hover:text-gold-600" aria-label={`Increase quantity of ${product.name}`}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="font-display text-base sm:text-lg text-maroon-900">
                        ₹{(product.price * qty).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name} from bag`} className="text-maroon-900/40 hover:text-maroon-700 transition-colors shrink-0 self-center">
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-fit bg-maroon-900 text-ivory rounded-xl md:rounded-2xl p-5 md:p-7 md:sticky md:top-28"
        >
          <h3 className="font-display text-xl mb-4 md:mb-5">Order Summary</h3>
          <div className="space-y-2.5 text-sm font-body text-ivory/75">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
          </div>

          <p className="text-[11px] text-ivory/40 font-body mt-3">Promo codes can be applied at checkout. Try JHANVIKA10 for 10% off.</p>

          <div className="border-t border-ivory/15 mt-5 pt-4 flex justify-between font-display text-xl">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>

          <Link
            to="/checkout"
            className="w-full mt-6 py-3.5 rounded-full bg-gold-500 text-maroon-950 font-body text-sm tracking-wide hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
