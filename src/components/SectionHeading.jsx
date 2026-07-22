import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", dark = false }) {
  const alignClass = align === "left" ? "items-start text-left" : "items-center text-center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${alignClass} mb-10 md:mb-14`}
    >
      {eyebrow && (
        <span className={`text-xs tracking-[0.35em] uppercase font-body mb-3 ${dark ? "text-gold-300" : "text-gold-600"}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl md:text-5xl leading-tight ${dark ? "text-ivory" : "text-maroon-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 max-w-xl font-body text-sm md:text-base ${dark ? "text-ivory/60" : "text-maroon-900/60"}`}>
          {subtitle}
        </p>
      )}
      <div className="divider-diamond mt-5">
        <span className={`w-1.5 h-1.5 rotate-45 ${dark ? "bg-gold-300" : "bg-gold-500"}`} />
      </div>
    </motion.div>
  );
}
