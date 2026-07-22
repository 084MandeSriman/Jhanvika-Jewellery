import { motion } from "framer-motion";
import { ShieldCheck, Truck, RefreshCcw, Gem } from "lucide-react";

const items = [
  { icon: Gem, title: "Certified Purity", desc: "Every gemstone hallmark verified" },
  { icon: Truck, title: "Free Insured Shipping", desc: "On all orders above ₹2,999" },
  { icon: RefreshCcw, title: "15-Day Easy Exchange", desc: "No questions asked policy" },
  { icon: ShieldCheck, title: "Lifetime Care Promise", desc: "Free polishing & cleaning" },
];

export default function USPBar() {
  return (
    <section className="bg-ivory-deep border-y border-gold-200/60">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-center md:text-left"
          >
            <item.icon className="text-gold-600 shrink-0" size={26} strokeWidth={1.4} />
            <div>
              <h4 className="font-body text-sm text-maroon-900 font-medium">{item.title}</h4>
              <p className="text-xs text-maroon-900/55 font-body hidden md:block">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
