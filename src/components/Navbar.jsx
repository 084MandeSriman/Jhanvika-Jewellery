import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, Gem, User } from "lucide-react";
import { useCategories } from "../hooks/useCatalogue";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { SearchAPI } from "../api/services";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { count, wishlist } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { categories } = useCategories();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      SearchAPI.autocomplete(query.trim()).then((res) => setSuggestions(res.data)).catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      SearchAPI.track(query.trim(), suggestions.length).catch(() => {});
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
      setSuggestions([]);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-ivory/95 backdrop-blur shadow-[0_2px_20px_rgba(46,15,12,0.08)]" : "bg-ivory/70 backdrop-blur-sm"
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-maroon-900 text-gold-200 text-[11px] tracking-[0.2em] text-center py-2 uppercase font-body">
        Complimentary shipping on orders above ₹2,999 &nbsp;•&nbsp; Lifetime exchange promise
      </div>

      <nav className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between h-20">
        {/* Mobile menu toggle */}
        <button className="md:hidden text-maroon-900" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={26} />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.span
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="text-gold-600 group-hover:rotate-12 transition-transform duration-500"
          >
            <Gem size={26} strokeWidth={1.5} />
          </motion.span>
          <div className="leading-none">
            <div className="font-display text-2xl md:text-3xl tracking-wide text-maroon-900">
              Jhanvika
            </div>
            <div className="text-[9px] md:text-[10px] tracking-[0.35em] text-gold-600 uppercase font-body -mt-0.5">
              Jewelleries
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 font-body text-sm tracking-wide">
          {categories.slice(0, 5).map((c) => (
            <NavLink
              key={c.id}
              to={`/shop/${c.id}`}
              className={({ isActive }) =>
                `relative py-2 text-maroon-900/80 hover:text-maroon-900 transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:bg-gold-500 after:transition-all ${
                  isActive ? "after:w-full text-maroon-900" : "after:w-0 hover:after:w-full"
                }`
              }
            >
              {c.name}
            </NavLink>
          ))}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `relative py-2 text-maroon-900/80 hover:text-maroon-900 transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:bg-gold-500 after:transition-all ${
                isActive ? "after:w-full text-maroon-900" : "after:w-0 hover:after:w-full"
              }`
            }
          >
            About
          </NavLink>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4 md:gap-5 text-maroon-900">
          <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search" className="hover:text-gold-600 transition-colors">
            <Search size={21} />
          </button>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="hidden sm:flex hover:text-gold-600 transition-colors items-center gap-1.5"
            aria-label={isAuthenticated ? "My account" : "Log in"}
          >
            <User size={21} />
            {isAuthenticated && <span className="text-xs font-body max-w-[80px] truncate">{user?.name?.split(" ")[0]}</span>}
          </Link>
          <Link to="/wishlist" className="relative hover:text-gold-600 transition-colors" aria-label="Wishlist">
            <Heart size={21} />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative hover:text-gold-600 transition-colors" aria-label="Shopping bag">
            <ShoppingBag size={21} />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-maroon-700 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
              >
                {count}
              </motion.span>
            )}
          </Link>
        </div>
      </nav>

      {/* Search bar dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gold-200/60 bg-ivory"
          >
            <form onSubmit={submitSearch} className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
              <Search size={18} className="text-maroon-700" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for necklaces, rings, jhumkas…"
                className="flex-1 bg-transparent outline-none font-body text-maroon-900 placeholder:text-maroon-900/40"
              />
              <button type="submit" className="text-sm tracking-wide text-gold-700 hover:text-gold-600">
                Search
              </button>
            </form>
            {suggestions.length > 0 && (
              <div className="max-w-3xl mx-auto px-5 pb-4">
                <p className="text-[10px] uppercase tracking-wider text-maroon-900/40 font-body mb-2">Suggestions</p>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      to={`/product/${s.id}`}
                      onClick={() => { setSearchOpen(false); setQuery(""); setSuggestions([]); }}
                      className="text-sm font-body text-maroon-900 hover:text-gold-600 py-1"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/50 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 w-[78%] max-w-xs bg-ivory z-50 p-6 flex flex-col gap-1 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-2xl text-maroon-900">Jhanvika</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={24} className="text-maroon-900" />
                </button>
              </div>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop/${c.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-gold-200/50 text-maroon-900 font-body text-base"
                >
                  {c.name}
                </Link>
              ))}
              <Link to="/about" onClick={() => setMobileOpen(false)} className="py-3 border-b border-gold-200/50 text-maroon-900 font-body text-base">
                About Us
              </Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="py-3 border-b border-gold-200/50 text-maroon-900 font-body text-base">
                Contact
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
