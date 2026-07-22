import { Link } from "react-router-dom";
import { Gem, MapPin, Phone, Mail } from "lucide-react";
import { useCategories } from "../hooks/useCatalogue";

// Minimal inline glyphs (lucide's current build no longer ships brand icons)
const Instagram = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const Facebook = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M15 8h-2a2 2 0 0 0-2 2v2H9v3h2v7h3v-7h2.2l.8-3H14v-1.5c0-.6.4-1 1-1h2V8Z" />
  </svg>
);
const Youtube = (props) => (
  <svg viewBox="0 0 24 24" width={props.size || 16} height={props.size || 16} fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="6" width="18" height="12" rx="4" />
    <path d="M11 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export default function Footer() {
  const { categories } = useCategories();
  return (
    <footer className="bg-maroon-fade bg-maroon-900 text-ivory/90 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gem className="text-gold-400" size={24} strokeWidth={1.5} />
              <span className="font-display text-2xl text-ivory">Jhanvika</span>
            </div>
            <p className="text-sm text-ivory/60 leading-relaxed font-body max-w-xs">
              Handcrafted jewellery rooted in Indian heritage, designed for the modern woman. Every
              piece is a small heirloom in the making.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="#" className="w-9 h-9 rounded-full border border-gold-500/40 flex items-center justify-center hover:bg-gold-500 hover:text-maroon-900 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-gold-500/40 flex items-center justify-center hover:bg-gold-500 hover:text-maroon-900 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-gold-500/40 flex items-center justify-center hover:bg-gold-500 hover:text-maroon-900 transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg text-gold-300 mb-4 tracking-wide">Shop</h4>
            <ul className="space-y-2.5 text-sm font-body text-ivory/65">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop/${c.id}`} className="hover:text-gold-300 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-gold-300 mb-4 tracking-wide">Company</h4>
            <ul className="space-y-2.5 text-sm font-body text-ivory/65">
              <li><Link to="/about" className="hover:text-gold-300 transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-gold-300 transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-gold-300 transition-colors">Care Guide</a></li>
              <li><a href="#" className="hover:text-gold-300 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-gold-300 transition-colors">Track Order</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-gold-300 mb-4 tracking-wide">Visit / Contact</h4>
            <ul className="space-y-3 text-sm font-body text-ivory/65">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
                <span>14 Kalasha Marg, Jaipur, Rajasthan 302001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-gold-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-gold-400" />
                <span>hello@jhanvikajewelleries.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-ivory/45 font-body">
          <p>© {new Date().getFullYear()} Jhanvika Jewelleries. All rights reserved. This is a demo storefront — all products are illustrative.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gold-300">Privacy Policy</a>
            <a href="#" className="hover:text-gold-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
