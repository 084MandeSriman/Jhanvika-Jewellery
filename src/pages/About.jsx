import { motion } from "framer-motion";
import { Gem, Hammer, Leaf, Users } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import Newsletter from "../components/Newsletter";
import JewelArt from "../components/JewelArt";

const values = [
  { icon: Hammer, title: "Handcrafted Always", desc: "Every piece passes through the hands of skilled karigars before it reaches you." },
  { icon: Leaf, title: "Responsibly Sourced", desc: "We work with certified suppliers who follow ethical mining and trade practices." },
  { icon: Users, title: "Family First", desc: "Founded by three sisters, Jhanvika remains a family-run atelier at heart." },
  { icon: Gem, title: "Quality Over Quantity", desc: "We'd rather make 500 designs beautifully than 5,000 forgettably." },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-maroon-fade bg-maroon-900 overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold-300 text-xs tracking-[0.4em] uppercase font-body"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-6xl text-ivory mt-4 leading-tight"
          >
            Jewellery that carries a story worth telling
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-ivory/65 font-body mt-5 max-w-xl mx-auto"
          >
            Jhanvika Jewelleries began in 1994 as a single kundan workshop in the lanes of Jaipur's
            Johari Bazaar. Three decades on, we design for weddings, festivals and quiet everyday
            moments across India. (Illustrative brand story for this demo site.)
          </motion.p>
        </div>
      </section>

      {/* Story with jewel art */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-2 gap-14 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="text-gold-600 text-xs tracking-[0.35em] uppercase font-body">From Jaipur, With Love</span>
          <h2 className="font-display text-3xl md:text-4xl text-maroon-900 mt-4 leading-tight">
            Where every stone is set by hand
          </h2>
          <p className="text-maroon-900/65 font-body mt-5 leading-relaxed">
            Our founder, Jhanvika Devi, started with a single table and a dream of making bridal
            jewellery affordable without compromising on craft. Today, our atelier houses over 40
            karigars specialising in kundan, polki, meenakari and temple jewellery traditions — each
            piece still checked by hand before it ships.
          </p>
          <p className="text-maroon-900/65 font-body mt-4 leading-relaxed">
            We believe jewellery should feel personal. That's why we design collections around real
            moments — a sister's mehendi, a first Diwali as a couple, a promotion worth celebrating —
            rather than just trends.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center bg-ivory-deep rounded-3xl border border-gold-200/50 p-14"
        >
          <JewelArt type="necklace" theme="polki" className="w-full max-w-sm animate-float" />
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-ivory-deep py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <SectionHeading eyebrow="What We Stand For" title="Our Values" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-ivory rounded-2xl border border-gold-200/50 p-6 text-center hover:shadow-gold transition-shadow"
              >
                <v.icon className="mx-auto text-gold-600 mb-3" size={28} strokeWidth={1.4} />
                <h3 className="font-display text-lg text-maroon-900 mb-1.5">{v.title}</h3>
                <p className="text-xs text-maroon-900/60 font-body leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
