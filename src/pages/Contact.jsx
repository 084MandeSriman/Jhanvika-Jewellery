import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    window.setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <SectionHeading eyebrow="We'd Love to Hear From You" title="Contact Us" subtitle="Questions about an order, custom design, or just want to say hello?" />

      <div className="grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-5">
          {[
            { icon: MapPin, title: "Visit Our Atelier", desc: "14 Kalasha Marg, Johari Bazaar, Jaipur, Rajasthan 302001" },
            { icon: Phone, title: "Call Us", desc: "+91 98765 43210 (Mon–Sat, 10am–7pm)" },
            { icon: Mail, title: "Email Us", desc: "hello@jhanvikajewelleries.in" },
          ].map((info) => (
            <div key={info.title} className="flex gap-4 bg-ivory-deep rounded-2xl border border-gold-200/50 p-5">
              <info.icon className="text-gold-600 shrink-0" size={22} strokeWidth={1.5} />
              <div>
                <h4 className="font-body text-sm font-medium text-maroon-900">{info.title}</h4>
                <p className="text-sm text-maroon-900/60 font-body mt-0.5">{info.desc}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl overflow-hidden border border-gold-200/50 h-48 bg-emerald-900 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-noise opacity-30" />
            <p className="text-ivory/50 text-xs font-body relative">Map preview unavailable in demo</p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={onSubmit}
          className="md:col-span-3 bg-ivory-deep rounded-2xl border border-gold-200/50 p-6 md:p-8 space-y-5"
        >
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Your Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={onChange}
              placeholder="Priya Sharma"
              className="w-full px-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              placeholder="priya@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={onChange}
              placeholder="Tell us how we can help…"
              className="w-full px-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-maroon-900 text-ivory font-body text-sm tracking-wide hover:bg-gold-600 hover:text-maroon-950 transition-colors"
          >
            {sent ? <CheckCircle2 size={16} /> : <Send size={15} />}
            {sent ? "Message Sent!" : "Send Message"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
