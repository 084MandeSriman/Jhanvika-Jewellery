import { Link } from "react-router-dom";
import { Gem, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-32 text-center">
      <Gem className="mx-auto text-gold-500 mb-5 animate-float" size={48} strokeWidth={1.2} />
      <h1 className="font-display text-5xl text-maroon-900 mb-3">404</h1>
      <p className="text-maroon-900/60 font-body mb-8">This piece seems to have slipped off the shelf.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-maroon-900 text-ivory px-7 py-3 rounded-full font-body text-sm hover:bg-gold-600 hover:text-maroon-950 transition-colors">
        Back to Home <ArrowRight size={16} />
      </Link>
    </div>
  );
}
