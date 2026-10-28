import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategories } from "../hooks/useCatalogue";
import JewelArt from "./JewelArt";
import SectionHeading from "./SectionHeading";
import { resolveImageUrl } from "../utils/imageUrl";
import { scrollToTopImmediately } from "../utils/scroll";

const themeForCategory = {
  necklaces: "kundan",
  earrings: "ruby",
  rings: "diamond",
  bangles: "gold",
  mangalsutra: "polki",
  nosepins: "pearl",
};

// Delicate single-line jewelry glyphs — thin gold strokes, no fill.
const CategoryLineIcon = ({ type, className }) => {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.1,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "necklaces":
      return (
        <svg {...common}>
          <path d="M10 8c0 10 6 16 14 16s14-6 14-16" />
          <circle cx="24" cy="30" r="5" />
        </svg>
      );
    case "earrings":
      return (
        <svg {...common}>
          <circle cx="16" cy="10" r="2.4" />
          <path d="M16 12.5v5" />
          <path d="M12 17.5a4 4 0 0 0 8 0z" />
          <circle cx="32" cy="10" r="2.4" />
          <path d="M32 12.5v5" />
          <path d="M28 17.5a4 4 0 0 0 8 0z" />
        </svg>
      );
    case "rings":
      return (
        <svg {...common}>
          <circle cx="24" cy="30" r="10" />
          <path d="M20 20l4-8 4 8z" />
          <path d="M18 20h12" />
        </svg>
      );
    case "bangles":
      return (
        <svg {...common}>
          <ellipse cx="24" cy="16" rx="13" ry="6" />
          <ellipse cx="24" cy="24" rx="13" ry="6" />
          <ellipse cx="24" cy="32" rx="13" ry="6" />
        </svg>
      );
    case "mangalsutra":
      return (
        <svg {...common}>
          <path d="M12 8c0 10 5 15 12 15s12-5 12-15" strokeDasharray="0.2 3.4" />
          <path d="M20 23l4 6 4-6z" />
          <circle cx="24" cy="31" r="2" />
        </svg>
      );
    case "nosepins":
      return (
        <svg {...common}>
          <path d="M30 24a10 10 0 1 1-6-9" />
          <circle cx="20" cy="14" r="2" />
          <circle cx="14" cy="18" r="2" />
          <circle cx="14" cy="24" r="2" />
          <circle cx="20" cy="28" r="2" />
          <circle cx="21" cy="21" r="2" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="10" />
        </svg>
      );
  }
};

function CategoryCard({ c, i, resolveImageUrl }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: i * 0.05 }}
      className="snap-center shrink-0 w-[62%] xs:w-[52%] sm:w-[38%] md:w-auto"
    >
      <Link
        to={`/shop/${c.id}`}
        onClick={scrollToTopImmediately}
        className="group relative flex flex-col overflow-hidden rounded-[28px] bg-ivory h-[400px] md:h-[440px] hover:-translate-y-1 transition-transform duration-500"
      >
        {/* Image — fades into the card's background rather than a hard edge */}
        <div className="absolute inset-0">
          {c.image_url ? (
            <img
              src={resolveImageUrl(c.image_url)}
              alt={c.name}
              draggable={false}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_55%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_92%)]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8 opacity-90 group-hover:scale-110 transition-transform duration-700 [mask-image:linear-gradient(to_bottom,black_55%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_92%)]">
              <JewelArt type={c.type} theme={themeForCategory[c.id]} className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Content sits directly on the faded lower portion of the image */}
        <div className="relative z-10 mt-auto flex flex-col items-center text-center gap-2 px-4 pb-7 pt-4">
          <CategoryLineIcon type={c.id} className="h-8 w-8 text-gold-500" />
          <h3 className="font-display text-[13px] md:text-sm tracking-[0.18em] uppercase text-maroon-950">
            {c.name}
          </h3>
          <p className="text-xs md:text-[13px] text-maroon-950/60 leading-snug max-w-[16ch]">
            {c.tagline}
          </p>
          <span className="w-1.5 h-1.5 rotate-45 bg-gold-400/80 mt-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoryShowcase() {
  const { categories } = useCategories();
  const scrollerRef = useRef(null);
  const [showHint, setShowHint] = useState(true);

  // Dismiss the "swipe" hint the first time the user actually scrolls
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => setShowHint(false);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
      <SectionHeading
        eyebrow="Shop by Category"
        title="Find your forever piece"
        subtitle="From temple-inspired necklaces to everyday nose pins — explore our curated edits."
      />

      <div className="relative mt-12">
        {/* Mobile/tablet: swipeable single row. Desktop (md+): 6-col grid */}
        <div
          ref={scrollerRef}
          className="flex md:grid md:grid-cols-6 gap-4 md:gap-6
                     overflow-x-auto md:overflow-visible
                     snap-x snap-mandatory md:snap-none
                     scroll-px-6 px-6 -mx-6 md:px-0 md:mx-0
                     [-webkit-overflow-scrolling:touch]
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((c, i) => (
            <CategoryCard key={c.id} c={c} i={i} resolveImageUrl={resolveImageUrl} />
          ))}
        </div>

        {/* Swipe hint — mobile only, fades out after first scroll or 2.5s */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            onAnimationComplete={() => {
              setTimeout(() => setShowHint(false), 2500);
            }}
            className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-16 flex items-center justify-end
                       bg-gradient-to-l from-ivory via-ivory/70 to-transparent"
          >
            <motion.svg
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="h-5 w-5 mr-3 text-maroon-950/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </motion.svg>
          </motion.div>
        )}
      </div>
    </section>
  );
}