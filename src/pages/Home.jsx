import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Hammer, Sparkles, Award } from "lucide-react";
import Hero from "../components/Hero";
import USPBar from "../components/USPBar";
import CategoryShowcase from "../components/CategoryShowcase";
import ProductCard from "../components/ProductCard";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import SectionHeading from "../components/SectionHeading";
import BudgetSection from "../components/BudgetSection";
import { useProducts } from "../hooks/useCatalogue";

export default function Home() {
  const { products: bestsellers } = useProducts({ badge: "Bestseller", limit: 8 });
  const { products: newArrivals } = useProducts({ badge: "New", limit: 4 });

  return (
    <div>
      <Helmet>
        <title>Jhanvika Jewelleries — Handcrafted Fine Jewellery | Bridal, Gold & Diamond Collections</title>
        <meta name="description" content="Shop handcrafted bridal and everyday jewellery at Jhanvika Jewelleries — kundan, polki, temple jewellery, diamonds and gold, with free shipping and 15-day exchange." />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="Jhanvika Jewelleries — Heirlooms in the Making" />
        <meta property="og:description" content="Handcrafted bridal & everyday jewellery rooted in Indian heritage." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Hero />
      <USPBar />

      <CategoryShowcase />

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16">
        <SectionHeading eyebrow="Most Loved" title="Our Bestsellers" subtitle="The pieces our customers keep coming back for." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
          {bestsellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-maroon-900 text-maroon-900 px-7 py-3 rounded-full font-body text-sm tracking-wide hover:bg-maroon-900 hover:text-ivory transition-colors group"
          >
            View Full Collection
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <BudgetSection />

      {/* Craftsmanship story / signature section
        <div className="absolute inset-0 bg-noise opacity-25 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-14 items-center relative">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-gold-300 text-xs tracking-[0.35em] uppercase font-body">Our Craft</span>
            <h2 className="font-display text-4xl md:text-5xl text-ivory mt-4 leading-tight">
              Three generations of goldsmiths, one promise of quality
            </h2>
            <p className="text-ivory/65 font-body mt-5 max-w-lg leading-relaxed">
              Every Jhanvika piece begins as a sketch in our Jaipur atelier, passed through the hands
              of karigars who have honed their craft over decades. We blend time-honoured techniques —
              kundan setting, meenakari enamelling, temple coin work — with designs made for how you
              actually live and celebrate today.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-9">
              {[
                { icon: Hammer, label: "40+ Master Karigars" },
                { icon: Sparkles, label: "500+ Unique Designs" },
                { icon: Award, label: "Est. Trust Since 1994*" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto text-gold-300 mb-2" size={24} strokeWidth={1.4} />
                  <p className="text-ivory/70 text-xs font-body leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-ivory/30 text-[11px] font-body mt-4">*Illustrative brand heritage for demo purposes.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex items-center justify-center"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-gold-300/25 flex items-center justify-center animate-spin-slow">
              <div className="w-48 h-48 md:w-60 md:h-60 rounded-full border border-dashed border-gold-300/30" />
            </div>
            <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full bg-gold-400/10 blur-2xl" />
            <span className="absolute font-script text-7xl md:text-8xl text-gold-300">J</span>
          </motion.div>
        </div>
      </section> */}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <SectionHeading eyebrow="Just Landed" title="New Arrivals" subtitle="Fresh off the karigar's workbench." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <Testimonials />
      <Newsletter />
    </div>
  );
}
