import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useCatalogue";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";

export default function Wishlist() {
  const { wishlist } = useCart();
  const { products } = useProducts({ limit: 200 });
  const items = products.filter((p) => wishlist.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center">
        <Heart className="mx-auto text-gold-400 mb-5" size={48} strokeWidth={1.2} />
        <h1 className="font-display text-3xl text-maroon-900 mb-3">Your wishlist is empty</h1>
        <p className="text-maroon-900/60 font-body mb-8">Tap the heart icon on any piece to save it for later.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-maroon-900 text-ivory px-7 py-3 rounded-full font-body text-sm hover:bg-gold-600 hover:text-maroon-950 transition-colors">
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <SectionHeading eyebrow="Saved For Later" title="Your Wishlist" align="left" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
