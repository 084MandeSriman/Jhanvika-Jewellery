import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import image1 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_20_29 AM.png";
import image2 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_26_59 AM.png";
import image3 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_28_32 AM.png";

const budgetTiers = [
  { label: "₹15,000", maxPrice: 15000, image: image1 },
  { label: "₹30,000", maxPrice: 30000, image: image2 },
  { label: "₹60,000", maxPrice: 60000, image: image3 },
];

// Semicircle top, gently rounded bottom — the "arch" shape from the reference.
const ARCH_RADIUS = "999px 999px 28px 28px";

function Sparkle({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 0c0 5.5 1.2 8.3 3.4 10.6C17.7 12.8 20.5 14 24 14c-3.5 0-6.3 1.2-8.6 3.4C13.2 19.7 12 22.5 12 28c0-5.5-1.2-8.3-3.4-10.6C6.3 15.2 3.5 14 0 14c3.5 0 6.3-1.2 8.6-3.4C10.8 8.3 12 5.5 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function BudgetSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
      <SectionHeading
        eyebrow="Shop By Budget"
        title="Budget-worthy finds for every occasion"
        subtitle="Choose a price range and explore pieces curated to your budget."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10 place-items-center">
        {budgetTiers.map((tier) => (
          <Link
            key={tier.maxPrice}
            to={`/shop?maxPrice=${tier.maxPrice}`}
            className="group relative w-full max-w-[280px] pt-8"
          >
            {/* sparkle floats above the arch */}
            <Sparkle className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 text-gold-400" />

            <div
              className="relative flex flex-col overflow-hidden border border-gold-200 bg-ivory shadow-[0_20px_50px_rgba(120,64,8,0.12)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl"
              style={{ borderRadius: ARCH_RADIUS }}
            >
              {/* image fills the arch */}
              <div className="relative h-[280px] w-full">
                <img
                  src={tier.image}
                  alt={`Jewellery under ${tier.label}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* text panel below, same bordered shape */}
              <div className="flex flex-col items-center gap-1 px-6 pb-9 pt-6 text-center">
                <p className="text-sm text-maroon-900/60">Under</p>
                <p className="font-display text-3xl text-maroon-900">{tier.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}