import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, ChevronRight, RotateCcw, Gem, IndianRupee, Filter } from "lucide-react";
import { themeList, themeLabels } from "../data/themes";
import { useCategories, useProducts } from "../hooks/useCatalogue";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

export default function Shop() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const urlMaxPrice = Number(searchParams.get("maxPrice"));

  const [activeThemes, setActiveThemes] = useState([]);
  const [draftThemes, setDraftThemes] = useState([]);
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(Number.isFinite(urlMaxPrice) && urlMaxPrice > 0 ? urlMaxPrice : 35000);
  const [draftMaxPrice, setDraftMaxPrice] = useState(Number.isFinite(urlMaxPrice) && urlMaxPrice > 0 ? urlMaxPrice : 35000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (Number.isFinite(urlMaxPrice) && urlMaxPrice > 0) {
      setMaxPrice(urlMaxPrice);
      setDraftMaxPrice(urlMaxPrice);
    }
  }, [urlMaxPrice]);

  const { categories } = useCategories();
  const category = categories.find((c) => c.id === categoryId);

  const { products: filtered, loading } = useProducts({
    category: categoryId || undefined,
    search: searchQuery || undefined,
    theme: activeThemes.length ? activeThemes.join(",") : undefined,
    maxPrice,
    sort,
  });

  const toggleTheme = (theme) => {
    setDraftThemes((prev) => (prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]));
  };

  const applyFilters = () => {
    setActiveThemes(draftThemes);
    setMaxPrice(draftMaxPrice);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setDraftThemes([]);
    setActiveThemes([]);
    setDraftMaxPrice(35000);
    setMaxPrice(35000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <Helmet>
        <title>{category ? `${category.name} — Jhanvika Jewelleries` : "Shop All Jewellery — Jhanvika Jewelleries"}</title>
        <meta name="description" content={category?.tagline || "Browse our full collection of handcrafted necklaces, earrings, rings, bangles and more."} />
        <link rel="canonical" href={categoryId ? `/shop/${categoryId}` : "/shop"} />
      </Helmet>
      <SectionHeading
        eyebrow={searchQuery ? "Search Results" : category ? "Collection" : "All Jewellery"}
        title={searchQuery ? `Results for "${searchQuery}"` : category ? category.name : "Explore Everything"}
        subtitle={category?.tagline || "Curated fine jewellery for every celebration and every day."}
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar - desktop */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 self-start sticky top-[calc(var(--storefront-header-height,7rem)+1rem)] max-h-[calc(100vh-var(--storefront-header-height,7rem)-2rem)] overflow-y-auto">
          <FilterPanel
            draftThemes={draftThemes}
            toggleTheme={toggleTheme}
            draftMaxPrice={draftMaxPrice}
            setMaxPrice={setDraftMaxPrice}
            onApply={applyFilters}
            onClear={clearFilters}
          />
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 border border-gold-300 rounded-full px-4 py-2 text-sm font-body text-maroon-900"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            <p className="text-sm text-maroon-900/60 font-body hidden md:block">{filtered.length} pieces</p>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none border border-gold-300 rounded-full pl-4 pr-9 py-2 text-sm font-body text-maroon-900 bg-ivory outline-none cursor-pointer"
              >
                {sortOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-maroon-900/60" />
            </div>
          </div>

          {/* Category chips when viewing all */}
          {!category && (
            <div className="flex gap-2 flex-wrap mb-6">
              <Link to="/shop" className="text-xs font-body px-3 py-1.5 rounded-full bg-maroon-900 text-ivory">
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop/${c.id}`}
                  className="text-xs font-body px-3 py-1.5 rounded-full border border-gold-300 text-maroon-900 hover:bg-gold-100 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-ivory-deep animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-2xl text-maroon-900 mb-2">No pieces found</p>
              <p className="text-maroon-900/60 font-body text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/50 z-50"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-ivory z-50 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl text-maroon-900">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}>
                  <X size={22} className="text-maroon-900" />
                </button>
              </div>
              <FilterPanel
                draftThemes={draftThemes}
                toggleTheme={toggleTheme}
                draftMaxPrice={draftMaxPrice}
                setMaxPrice={setDraftMaxPrice}
                onApply={applyFilters}
                onClear={clearFilters}
                showApply={false}
              />
              <button
                onClick={applyFilters}
                className="w-full mt-5 py-3 rounded-full bg-maroon-900 text-ivory font-body text-sm"
              >
                Apply Filters <ChevronRight size={16} className="inline ml-1" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({ draftThemes, toggleTheme, draftMaxPrice, setMaxPrice, onApply, onClear, showApply = true }) {
  const [stoneOpen, setStoneOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl border border-gold-300/80 bg-ivory/80">
      <div className="flex items-center justify-between border-b border-gold-200/70 px-5 py-4">
        <h3 className="flex items-center gap-3 font-display text-xl text-maroon-900">
          <Filter size={18} fill="currentColor" /> Filters
        </h3>
        <button onClick={onClear} className="flex items-center gap-1.5 text-xs font-body text-maroon-900/60 hover:text-gold-700">
          Clear All <RotateCcw size={14} />
        </button>
      </div>

      <div className="px-5">
        <section className="border-b border-gold-200/70 py-5">
          <button onClick={() => setStoneOpen((open) => !open)} className="flex w-full items-center justify-between text-left">
            <span className="flex items-center gap-3 font-body text-sm font-medium text-maroon-900">
              <Gem size={17} /> Stone / Finish
            </span>
            {stoneOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {stoneOpen && (
            <div className="mt-5 flex flex-wrap gap-2">
              {themeList.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTheme(t)}
                  className={`rounded-full border px-4 py-2 text-xs font-body transition-colors ${
                    draftThemes.includes(t)
                      ? "border-maroon-900 bg-maroon-900 text-ivory"
                      : "border-gold-300 text-maroon-900 hover:bg-gold-100"
                  }`}
                >
                  {themeLabels[t]}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="py-5">
          <button onClick={() => setPriceOpen((open) => !open)} className="flex w-full items-center justify-between text-left">
            <span className="flex items-center gap-3 font-body text-sm font-medium text-maroon-900">
              <IndianRupee size={17} /> Price Range
            </span>
            {priceOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {priceOpen && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-body text-maroon-900">
                <span>₹500</span>
                <span>₹{draftMaxPrice.toLocaleString("en-IN")}{draftMaxPrice >= 35000 ? "+" : ""}</span>
              </div>
              <input
                type="range"
                min="500"
                max="35000"
                step="500"
                value={draftMaxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum price"
                className="w-full accent-gold-600"
              />
            </div>
          )}
        </section>

        {showApply && (
          <button
            onClick={onApply}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-maroon-900 py-3 text-sm font-body text-ivory transition-colors hover:bg-gold-600 hover:text-maroon-950"
          >
            Apply Filters <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
