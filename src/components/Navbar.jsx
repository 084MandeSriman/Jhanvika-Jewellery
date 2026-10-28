import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, User, Mic } from "lucide-react";
import { useCategories } from "../hooks/useCatalogue";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { SearchAPI } from "../api/services";

/* -------------------------------------------------------------------------
   Palette (taken from the reference): cream background, deep brown ink, gold
   ------------------------------------------------------------------------- */
const INK = "text-[#4a1d12]";
const GOLD_TEXT = "text-[#b8842c]";

// Words that roll inside the search bar:  "Search for  <word>"
const PLACEHOLDERS = [
  "gold necklace",
  "engagement rings",
  "diamond jewellery",
  "jhumkas",
  "mangalsutra",
  "bangles",
];

// Used only if the API returns no categories
const FALLBACK_CATEGORIES = [
  { id: "necklaces", name: "Necklaces" },
  { id: "earrings", name: "Earrings" },
  { id: "rings", name: "Rings" },
  { id: "bangles", name: "Bangles & Bracelets" },
  { id: "mangalsutra", name: "Mangalsutra" },
  { id: "nose-pins", name: "Nose Pins & Rings" },
];

/* -------------------------------------------------------------------------
   Header icons — thick rounded outline
   ------------------------------------------------------------------------- */
const outline = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const CameraPlusIcon = ({ size = 28 }) => (
  <svg viewBox="0 0 28 28" width={size} height={size} aria-hidden {...outline} strokeWidth={1.8}>
    <rect x="3" y="9" width="20" height="15" rx="3.5" />
    <circle cx="13" cy="16.5" r="4" />
    <path d="M8.5 9l1.3-2.5h4.4L15.5 9" />
    <path d="M22 1.8v6M19 4.8h6" />
  </svg>
);

/* Gold gradients used by the logo + category art (defined once, referenced by id) */
const GoldDefs = () => (
  <svg aria-hidden style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <linearGradient id="jhGold" gradientUnits="userSpaceOnUse" x1="8" y1="6" x2="56" y2="58">
        <stop offset="0%" stopColor="#9f6b1d" />
        <stop offset="55%" stopColor="#d6a54f" />
        <stop offset="100%" stopColor="#a8741f" />
      </linearGradient>
      <linearGradient id="jhGoldLogo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="44" y2="36">
        <stop offset="0%" stopColor="#9f6b1d" />
        <stop offset="55%" stopColor="#d6a54f" />
        <stop offset="100%" stopColor="#a8741f" />
      </linearGradient>
    </defs>
  </svg>
);

const GemMark = ({ className = "" }) => (
  <svg viewBox="0 0 44 36" className={className} fill="none" stroke="url(#jhGoldLogo)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 3h22l9 10.5L22 33 2 13.5z" />
    <path d="M2 13.5h40" />
    <path d="M15.5 3L12 13.5 22 33l10-19.5L28.5 3" />
  </svg>
);

/* -------------------------------------------------------------------------
   Gold line-art for the category circles
   ------------------------------------------------------------------------- */
const Art = ({ children }) => (
  <svg viewBox="0 0 64 64" className="h-6 w-6 shrink-0" fill="none" stroke="url(#jhGold)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {children}
  </svg>
);

const NecklaceArt = () => (
  <Art>
    <ellipse cx="32" cy="9" rx="6" ry="2" />
    <path d="M26 9v9M38 9v9" />
    <path d="M26 18c-8 2-15 6-17 15 5 7 13 11 23 11s18-4 23-11c-2-9-9-13-17-15" />
    <path d="M18 26c2 12 26 12 28 0" />
    <circle cx="32" cy="38.5" r="2.3" />
    <path d="M32 44v7M23 52h18" />
  </Art>
);

const jhumka = (cx) => (
  <g key={cx}>
    <circle cx={cx} cy="7" r="2.4" />
    <circle cx={cx} cy="14.5" r="2.4" />
    <path d={`M${cx} 16.9v4`} />
    <path d={`M${cx - 9} 38C${cx - 9} 29 ${cx - 5} 21 ${cx} 21S${cx + 9} 29 ${cx + 9} 38`} />
    <path d={`M${cx - 10} 38h20v4h-20z`} />
    <circle cx={cx} cy="31" r="1.2" />
    {[-8, -4, 0, 4, 8].map((d) => (
      <circle key={d} cx={cx + d} cy="46.5" r="1.3" />
    ))}
  </g>
);
const EarringsArt = () => <Art>{[18, 46].map(jhumka)}</Art>;

const RingArt = () => (
  <Art>
    <path d="M26 10h12l5 6-11 11-11-11z" />
    <path d="M21 16h22" />
    <path d="M27.5 10L26 16l6 11 6-11-1.5-6" />
    <circle cx="32" cy="42" r="14" />
    <circle cx="32" cy="42" r="10.5" />
  </Art>
);

const BanglesArt = () => (
  <Art>
    <g transform="rotate(-14 32 32)">
      {[24, 39].map((cy) => (
        <g key={cy}>
          <ellipse cx="32" cy={cy} rx="23" ry="8" />
          <ellipse cx="32" cy={cy} rx="19" ry="5.5" strokeDasharray="1 3.2" />
        </g>
      ))}
    </g>
  </Art>
);

const MangalsutraArt = () => (
  <Art>
    <path d="M12 8c1 17 11 29 20 31 9-2 19-14 20-31" />
    <path d="M12 8c1 17 11 29 20 31 9-2 19-14 20-31" strokeWidth="4" strokeDasharray="0.1 5.5" />
    <circle cx="32" cy="43" r="3.2" />
    <path d="M26 46v8M32 47.5v10M38 46v8" />
    <circle cx="26" cy="55.5" r="1.6" />
    <circle cx="32" cy="59.2" r="1.6" />
    <circle cx="38" cy="55.5" r="1.6" />
  </Art>
);

const NoseArt = () => (
  <Art>
    <path d="M42 14a19 19 0 1 0 3 24" />
    <g transform="translate(47 40)">
      <circle r="2" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={4.6 * Math.cos((a * Math.PI) / 180)} cy={4.6 * Math.sin((a * Math.PI) / 180)} r="2.6" />
      ))}
    </g>
  </Art>
);

const GemArt = () => (
  <Art>
    <path d="M18 14h28l12 14-26 28L6 28z" />
    <path d="M6 28h52" />
    <path d="M26 14l-6 14 12 28 12-28-6-14" />
  </Art>
);

// Pick the artwork from the category id / name (order matters: "earrings" contains "ring")
const artFor = (c) => {
  const k = `${c.id} ${c.name}`.toLowerCase();
  if (/neck|chain|pendant/.test(k)) return NecklaceArt;
  if (/ear|jhumk|stud/.test(k)) return EarringsArt;
  if (/mangal/.test(k)) return MangalsutraArt;
  if (/nose|nath/.test(k)) return NoseArt;
  if (/bangle|bracelet|kada/.test(k)) return BanglesArt;
  if (/ring/.test(k)) return RingArt;
  return GemArt;
};

/* ------------------------------------------------------------------------- */

export default function Navbar({ onImageSearch }) {
  const [showCats, setShowCats] = useState(true); // category row: hides on scroll down, returns on scroll up
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const [phIdx, setPhIdx] = useState(0);
  const [reserve, setReserve] = useState(134);

  const { count, wishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const lastY = useRef(0);
  const barRef = useRef(null);
  const catRef = useRef(null);
  const fileRef = useRef(null);

  const cats = (categories && categories.length ? categories : FALLBACK_CATEGORIES).slice(0, 6);

  /* Scroll behaviour: row is always visible at the top; down hides it, up brings it back */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.max(window.scrollY, 0);
        const dy = y - lastY.current;
        setScrolled(y > 8);
        if (y < 40) {
          setShowCats(true);
          lastY.current = y;
        } else if (dy > 6) {
          setShowCats(false);
          lastY.current = y;
        } else if (dy < -6) {
          setShowCats(true);
          lastY.current = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The header is fixed, so reserve its full (expanded) height to keep page content below it */
  useLayoutEffect(() => {
    const measure = () => {
      const expandedHeaderHeight = (barRef.current?.offsetHeight || 0) + (catRef.current?.offsetHeight || 0);
      if (expandedHeaderHeight > 0) {
        setReserve(expandedHeaderHeight);
        document.documentElement.style.setProperty("--storefront-header-height", `${expandedHeaderHeight}px`);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
    if (catRef.current) ro.observe(catRef.current);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--storefront-header-height");
    };
  }, []);

  /* Rolling placeholder */
  useEffect(() => {
    if (query) return;
    const t = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 2800);
    return () => clearInterval(t);
  }, [query]);

  /* Debounced autocomplete */
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      SearchAPI.autocomplete(query.trim())
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  /* Lock page scroll while the mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const goSearch = (term) => {
    const q = term.trim();
    if (!q) return;
    SearchAPI.track(q, suggestions.length).catch(() => {});
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    setQuery("");
    setSuggestions([]);
    setFocused(false);
    document.activeElement?.blur?.();
  };

  const submitSearch = (e) => {
    e.preventDefault();
    goSearch(query);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      goSearch(text);
    };
    rec.start();
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSearch) onImageSearch(file);
    e.target.value = "";
  };

  const iconBtn = `relative flex h-9 w-9 items-center justify-center rounded-full ${INK} transition-colors hover:text-[#b8842c]`;
  const badge = "absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#b8842c] px-1 text-[10px] font-semibold leading-none text-white";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-[#eadfcd] bg-[#fcf5e9] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_6px_24px_rgba(74,29,18,0.10)]" : ""
        }`}
      >
        <GoldDefs />

        {/* ------------------------------ Top bar ------------------------------ */}
        <div ref={barRef} className="mx-auto max-w-[1320px] px-4 md:px-6">
          <div className="flex flex-wrap items-center gap-x-3 py-2 lg:grid lg:h-[62px] lg:grid-cols-[1fr_minmax(0,35rem)_1fr] lg:gap-x-8 lg:py-0">
            {/* Mobile menu */}
            <button className={`lg:hidden ${INK}`} onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={26} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex flex-1 items-center gap-2.5 lg:flex-none lg:justify-self-start md:gap-3" aria-label="Jhanvika Jewelleries — home">
              <GemMark className="h-6 w-8 shrink-0 md:h-7 md:w-9" />
              <span className="flex flex-col leading-none">
                <span className={`font-display text-[1.5rem] font-medium tracking-[-0.01em] md:text-[1.85rem] ${INK}`}>Jhanvika</span>
                <span className={`-mt-0.5 pl-[0.35rem] font-body text-[0.45rem] uppercase tracking-[0.4em] md:text-[0.52rem] ${GOLD_TEXT}`}>Jewelleries</span>
              </span>
            </Link>

            {/* Search pill (own row on mobile, centred on desktop) */}
            <div className="relative order-last mt-2 basis-full lg:order-none lg:mt-0 lg:basis-auto">
              <form
                onSubmit={submitSearch}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
                }}
                className="flex h-[42px] items-center gap-2.5 rounded-full border border-[#e3d9c8] bg-[#fffaf1] px-4 transition-shadow focus-within:border-[#d6a54f] focus-within:shadow-[0_0_0_3px_rgba(214,165,79,0.18)] lg:h-[40px] lg:px-4"
              >
                <Search size={19} strokeWidth={1.9} className={`shrink-0 ${INK}`} />

                <div className="relative h-full flex-1">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
                    aria-label="Search jewellery"
                    autoComplete="off"
                    className={`h-full w-full bg-transparent font-body text-[0.9rem] outline-none ${INK}`}
                  />
                  {!query && (
                    <div className="pointer-events-none absolute inset-0 flex items-center gap-[0.3em] overflow-hidden whitespace-nowrap font-body text-[0.9rem] text-[#8d8478]">
                      <span>Search for</span>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={phIdx}
                          initial={{ y: reduce ? 0 : 16, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: reduce ? 0 : -16, opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}
                          className="inline-block"
                        >
                          {PLACEHOLDERS[phIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Search by image" title="Search by image" className={`shrink-0 ${INK} transition-colors hover:text-[#b8842c]`}>
                  <CameraPlusIcon size={22} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />

                <span className="h-5 w-px shrink-0 bg-[#e3d9c8]" />

                <button
                  type="button"
                  onClick={startVoice}
                  aria-label="Search by voice"
                  title="Search by voice"
                  className={`relative shrink-0 transition-colors hover:text-[#b8842c] ${listening ? "text-[#b8842c]" : INK}`}
                >
                  {listening && <span className="absolute -inset-1.5 animate-ping rounded-full bg-[#d6a54f]/40" />}
                  <Mic size={20} strokeWidth={1.8} className="relative" />
                </button>
              </form>

              {/* Autocomplete */}
              <AnimatePresence>
                {focused && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-2xl border border-[#e3d9c8] bg-[#fffaf1] py-2 shadow-[0_14px_34px_rgba(74,29,18,0.14)]"
                  >
                    <p className="px-5 pb-1 font-body text-[10px] uppercase tracking-wider text-[#4a1d12]/45">Suggestions</p>
                    {suggestions.map((s) => (
                      <Link
                        key={s.id}
                        to={`/product/${s.id}`}
                        onClick={() => {
                          setQuery("");
                          setSuggestions([]);
                          setFocused(false);
                        }}
                        className={`flex items-center gap-3 px-5 py-2 font-body text-[0.95rem] transition-colors hover:bg-[#f6ead3] ${INK}`}
                      >
                        <Search size={15} className="shrink-0 opacity-50" />
                        {s.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-0.5 sm:gap-4 lg:justify-self-end">
              <Link to="/wishlist" className={iconBtn} aria-label="Wishlist" title="Wishlist">
                <Heart size={22} strokeWidth={1.7} />
                {wishlist.length > 0 && <span className={badge}>{wishlist.length}</span>}
              </Link>
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className={iconBtn}
                aria-label={isAuthenticated ? "My account" : "Log in"}
                title={isAuthenticated ? "My account" : "Log in"}
              >
                <User size={22} strokeWidth={1.7} />
              </Link>
              <Link to="/cart" className={iconBtn} aria-label="Shopping bag" title="Shopping bag">
                <ShoppingBag size={22} strokeWidth={1.7} />
                <motion.span key={count} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className={badge}>
                  {count}
                </motion.span>
              </Link>
            </div>
          </div>
        </div>

        {/* ------------------- Category row (collapses on scroll down) ------------------- */}
        <motion.div
          initial={false}
          animate={
            showCats
              ? { height: "auto", opacity: 1, visibility: "visible" }
              : { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } }
          }
          transition={{ duration: reduce ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div ref={catRef} className="mx-auto max-w-[1320px] px-4 pb-2 pt-0.5 md:px-6">
            <ul className="flex gap-5 overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-6 md:gap-4 md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {cats.map((c) => {
                const ArtIcon = artFor(c);
                return (
                  <li key={c.id} className="w-[78px] shrink-0 md:w-auto">
                    <NavLink to={`/shop/${c.id}`} className="group flex flex-col items-center">
                      {({ isActive }) => (
                        <>
                          <span
                            className={`flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#fcf5e9] transition-all duration-300 group-hover:-translate-y-px group-hover:bg-[#f6ead3] group-hover:shadow-[0_4px_12px_rgba(184,132,44,0.22)] ${
                              isActive ? "border-2 border-[#b8842c] bg-[#f6ead3]" : "border border-[#b8842c]/80"
                            }`}
                          >
                            <ArtIcon />
                          </span>
                          <span
                            className={`mt-1 text-center font-body text-[0.84rem] leading-tight transition-colors group-hover:text-[#b8842c] ${
                              isActive ? "text-[#b8842c]" : INK
                            }`}
                          >
                            {c.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      </header>

      {/* Reserves the header's full height (header is fixed, so content scrolls beneath it) */}
      <div aria-hidden style={{ height: reserve }} />

      {/* ------------------------------ Mobile drawer ------------------------------ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 top-0 z-[61] flex w-[80%] max-w-xs flex-col gap-1 overflow-y-auto bg-[#fcf5e9] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className={`font-display text-2xl ${INK}`}>Jhanvika</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} className={INK} />
                </button>
              </div>
              {[
                ...cats.map((c) => ({ to: `/shop/${c.id}`, label: c.name })),
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/wishlist", label: "Wishlist" },
                { to: isAuthenticated ? "/account" : "/login", label: isAuthenticated ? "My Account" : "Log in" },
              ].map((l) => (
                <Link
                  key={l.to + l.label}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`border-b border-[#b8842c]/20 py-3 font-body text-base ${INK}`}
                >
                  {l.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}