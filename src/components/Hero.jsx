import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHeroSlides } from "../hooks/useCatalogue";
import JewelArt from "./JewelArt";

export default function Hero() {
  const [index, setIndex] = useState(0);
  const { heroSlides } = useHeroSlides();

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 5500);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  if (heroSlides.length === 0) {
    // Keeps the exact same section height while data loads, so layout never jumps
    return <section className="relative bg-maroon-fade bg-maroon-900 min-h-[88vh] md:min-h-[92vh]" />;
  }

  const slide = heroSlides[index % heroSlides.length];

  return (
    <section className="relative overflow-hidden bg-maroon-fade bg-maroon-900 min-h-[88vh] md:min-h-[92vh] flex items-center">
      {/* ambient background elements */}
      <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-emerald-700/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* rotating mandala ring - signature element */}
      <svg
        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[38rem] h-[38rem] opacity-[0.14] animate-spin-slow pointer-events-none hidden md:block"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="92" fill="none" stroke="#e9c363" strokeWidth="0.6" />
        <circle cx="100" cy="100" r="74" fill="none" stroke="#e9c363" strokeWidth="0.6" strokeDasharray="2 6" />
        {[...Array(24)].map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={100 + 74 * Math.cos(a)}
              y1={100 + 74 * Math.sin(a)}
              x2={100 + 92 * Math.cos(a)}
              y2={100 + 92 * Math.sin(a)}
              stroke="#e9c363"
              strokeWidth="0.6"
            />
          );
        })}
        <circle cx="100" cy="100" r="50" fill="none" stroke="#e9c363" strokeWidth="0.5" />
      </svg>

      <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-10 items-center relative z-10 w-full py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-gold-300 text-xs tracking-[0.4em] uppercase font-body">{slide.eyebrow}</span>
            <h1 className="font-display text-5xl md:text-7xl text-ivory mt-4 leading-[1.05] whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-ivory/65 font-body mt-5 max-w-md text-base md:text-lg">{slide.subtitle}</p>
            <Link
              to={slide.link}
              className="inline-flex items-center gap-2 mt-8 bg-gold-500 text-maroon-950 px-7 py-3.5 rounded-full font-body text-sm tracking-wide hover:bg-gold-400 transition-colors group"
            >
              {slide.cta}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-art"}
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 6 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center animate-float"
          >
            <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gold-400/10 blur-2xl" />
            <JewelArt type={slide.type} theme={slide.theme} className="w-72 h-72 md:w-[26rem] md:h-[26rem] drop-shadow-2xl" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-gold-400" : "w-1.5 bg-ivory/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
