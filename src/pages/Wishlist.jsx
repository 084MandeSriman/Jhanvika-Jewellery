import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useCatalogue";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";

export default function Wishlist() {
  const { wishlist } = useCart();
  const { products } = useProducts({ limit: 200 });
  const items = products.filter((p) => wishlist.includes(p.id));
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    const updateScrollButtons = () => {
      setCanScrollLeft(carousel.scrollLeft > 0);
      setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1);
    };

    updateScrollButtons();
    carousel.addEventListener("scroll", updateScrollButtons, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(carousel);

    return () => {
      carousel.removeEventListener("scroll", updateScrollButtons);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  const scrollWishlist = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: "smooth" });
  };

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
      <SectionHeading eyebrow="Saved For Later" title="Your Wishlist" />
      <div className="relative">
        {items.length > 4 && (
          <>
            <button
              type="button"
              onClick={() => scrollWishlist(-1)}
              disabled={!canScrollLeft}
              aria-label="Previous wishlist products"
              className="absolute -left-4 md:-left-6 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-300 bg-ivory text-maroon-900 shadow-md transition-colors hover:bg-gold-100 disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollWishlist(1)}
              disabled={!canScrollRight}
              aria-label="Next wishlist products"
              className="absolute -right-4 md:-right-6 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gold-300 bg-ivory text-maroon-900 shadow-md transition-colors hover:bg-gold-100 disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <div
          ref={carouselRef}
          className="grid grid-flow-col auto-cols-[calc((100%-1.25rem)/2)] md:auto-cols-[calc((100%-3.5rem)/3)] lg:auto-cols-[calc((100%-5.25rem)/4)] gap-5 md:gap-7 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p, i) => (
            <div key={p.id} className="snap-start">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
