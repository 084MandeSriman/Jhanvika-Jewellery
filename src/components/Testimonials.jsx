import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTestimonials } from "../hooks/useCatalogue";
import SectionHeading from "./SectionHeading";

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TreeBackground({ count }) {
  const branches = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const tipX = ((i + 0.5) / count) * 100;
      const midX = 50 + (tipX - 50) * 0.55;
      const tipY = 9 + (i % 2 === 0 ? 0 : 2.5);
      return { tipX, midX, tipY };
    });
  }, [count]);

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="barkGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#3a0f14" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7a2230" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <path
        d="M50 40 C 49.5 33, 50.5 27, 50 21"
        stroke="url(#barkGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      {branches.map((b, i) => (
        <path
          key={i}
          d={`M50 ${24 - (i % 2)} C ${b.midX} ${18 - (i % 3)}, ${b.midX} ${12 + (i % 2)}, ${b.tipX} ${b.tipY}`}
          stroke="url(#barkGrad)"
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
      ))}

      {branches.map((b, i) => (
        <path
          key={`twig-${i}`}
          d={`M${b.midX} ${16 - (i % 2)} C ${(b.midX + b.tipX) / 2} ${13}, ${(b.midX + b.tipX) / 2 + 4} ${10}, ${b.tipX + 3} ${b.tipY - 3}`}
          stroke="#7a2230"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
      ))}
    </svg>
  );
}

function leafRadius(pointRight) {
  return pointRight
    ? "rounded-tl-[8px] rounded-br-[8px] rounded-tr-[90px] rounded-bl-[90px]"
    : "rounded-tr-[8px] rounded-bl-[8px] rounded-tl-[90px] rounded-br-[90px]";
}

export default function Testimonials() {
  const { testimonials } = useTestimonials();
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="bg-ivory relative overflow-hidden py-24 md:py-32">
      <TreeBackground count={testimonials.length || 1} />
      <div className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative">
        <SectionHeading
          eyebrow="Words From Our Family"
          title="Loved across India"
          subtitle="Real (illustrative) stories from customers who trusted Jhanvika for their milestone moments."
        />

        <div className="relative mt-20">
          <div
            className="flex items-start gap-10 md:gap-12 overflow-x-auto
                       px-6 -mx-6 pt-6 pb-10
                       [-webkit-overflow-scrolling:touch]
                       [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {testimonials.map((t, i) => {
              const isActive = hoveredId === t.id;
              const curve = i % 2 === 0 ? 1 : -1;
              const pointRight = i % 2 === 0;
              const swingDuration = 4 + (i % 3) * 0.6;
              const swingDelay = i * 0.35;
              const baseAngle = i % 2 === 0 ? 2 : -2;

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="shrink-0 w-[240px] md:w-[255px] flex flex-col items-center"
                >
                  <motion.div
                    style={{ transformOrigin: "top center" }}
                    animate={{ rotate: [baseAngle, -baseAngle, baseAngle] }}
                    transition={{
                      duration: swingDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: swingDelay,
                    }}
                    whileHover={{ rotate: 0, transition: { duration: 0.3, ease: "easeOut" } }}
                    onHoverStart={() => setHoveredId(t.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    className="w-full flex flex-col items-center cursor-pointer"
                  >
                    <svg viewBox="0 0 40 56" className="h-14 w-10">
                      <path
                        d={`M20 0 C ${20 + 9 * curve} 16, ${20 - 9 * curve} 32, 20 56`}
                        stroke={isActive ? "#e8b84b" : "#e8b84b88"}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-300"
                      />
                    </svg>

                    <motion.div
                      whileHover={{ y: -6, scale: 1.04 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`w-full ${leafRadius(pointRight)} p-6 pt-8 flex flex-col
                                  border transition-colors duration-300 ease-out
                                  ${
                                    isActive
                                      ? "bg-gold-50 border-gold-200 shadow-[0_25px_55px_-15px_rgba(232,184,75,0.4)]"
                                      : "bg-ivory border-ivory/40 shadow-[0_20px_45px_-18px_rgba(0,0,0,0.35)]"
                                  }`}
                    >
                      <Quote
                        size={20}
                        className={`mb-3 transition-colors duration-300 ${
                          isActive ? "text-maroon-700/60" : "text-maroon-800/35"
                        }`}
                      />

                      <p
                        className={`font-body text-[13px] leading-relaxed mb-4 flex-1 transition-colors duration-300 ${
                          isActive ? "text-maroon-950/80" : "text-maroon-950/60"
                        }`}
                      >
                        {t.text}
                      </p>

                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, s) => (
                          <Star
                            key={s}
                            size={12}
                            className={
                              s < t.rating
                                ? "fill-gold-500 text-gold-500"
                                : "text-maroon-950/15"
                            }
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-3 border-t border-maroon-950/10">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                            isActive
                              ? "bg-maroon-700 text-gold-200"
                              : "bg-maroon-50 text-maroon-700"
                          }`}
                        >
                          {initials(t.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm leading-tight truncate text-maroon-950">
                            {t.name}
                          </p>
                          <p className="text-[11px] truncate text-maroon-950/45">
                            {t.location}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}