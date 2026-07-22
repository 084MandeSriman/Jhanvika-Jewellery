import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import insta1 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_20_29 AM.png";
import insta2 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_26_59 AM.png";
import insta3 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_28_32 AM.png";
import insta4 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_33_20 AM.png";
import insta5 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_35_59 AM.png";
import insta6 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_37_24 AM.png";
import insta7 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_40_50 AM.png";
import insta8 from "../assets/instagram/ChatGPT Image Jul 22, 2026, 11_42_07 AM.png";

function Instagram(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={props.size || 16}
      height={props.size || 16}
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 1.6}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Swap any `image` URL for your own product/lifestyle photography whenever ready —
// these are placeholder external images so the layout can be reviewed live.
const POSTS = [
  {
    likes: "2,481",
    comments: "94",
    image: insta1,
  },
  {
    likes: "3,102",
    comments: "156",
    image: insta2,
  },
  {
    likes: "1,847",
    comments: "63",
    image: insta3,
  },
  {
    likes: "4,220",
    comments: "211",
    image: insta4,
  },
  {
    likes: "2,905",
    comments: "88",
    image: insta5,
  },
  {
    likes: "3,678",
    comments: "142",
    image: insta6,
  },
  {
    likes: "1,563",
    comments: "47",
    image: insta7,
  },
  {
    likes: "5,014",
    comments: "268",
    image: insta8,
  },
];

function InstaAvatar({ size = 32 }) {
  return (
    <div
      className="rounded-full p-[2px] flex-shrink-0"
      style={{
        background: "linear-gradient(135deg,#F9CE34,#EE2A7B,#6228D7)",
        width: size,
        height: size,
      }}
    >
      <div className="w-full h-full rounded-full bg-ivory flex items-center justify-center">
        <span className="font-display text-gold-700 text-[13px] leading-none">J</span>
      </div>
    </div>
  );
}

function PostCard({ post, index }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const tilt = index % 2 === 0 ? -3 : 3;
  const likeCount = liked
    ? (Number(post.likes.replace(/,/g, "")) + 1).toLocaleString()
    : post.likes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      whileHover={{ rotate: 0, y: -6, scale: 1.02 }}
      style={{ rotate: tilt }}
      className="snap-center flex-shrink-0 w-[260px] sm:w-[280px] rounded-2xl overflow-hidden shadow-none"
    >
      {/* header */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <InstaAvatar />
          <span className="font-body text-[13px] font-semibold text-maroon-950">
            jhanvika_jewelleries
          </span>
        </div>
        <MoreHorizontal size={16} className="text-maroon-900/40" />
      </div>

      {/* pure photo, full-bleed, no text overlay, no inner container */}
      <div className="relative aspect-square overflow-hidden bg-transparent">
        <img
          src={post.image}
          alt="Jhanvika Jewelleries"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* actions */}
      <div className="px-3.5 pt-2.5 pb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button onClick={() => setLiked((v) => !v)} aria-label="Like">
              <Heart
                size={20}
                className={liked ? "text-red-500 fill-red-500" : "text-maroon-950"}
                strokeWidth={1.6}
              />
            </button>
            <MessageCircle size={20} className="text-maroon-950" strokeWidth={1.6} />
            <Send size={19} className="text-maroon-950" strokeWidth={1.6} />
          </div>
          <button onClick={() => setSaved((v) => !v)} aria-label="Save">
            <Bookmark
              size={19}
              className={saved ? "text-maroon-950 fill-maroon-950" : "text-maroon-950"}
              strokeWidth={1.6}
            />
          </button>
        </div>
        <p className="font-body text-[12.5px] font-semibold text-maroon-950 mt-2">
          {likeCount} likes
        </p>
        <p className="font-body text-[12px] text-maroon-900/50 mt-0.5">
          View all {post.comments} comments
        </p>
      </div>
    </motion.div>
  );
}

export default function InstagramShowcase() {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollByCard = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth || 280;
    el.scrollBy({ left: dir * (cardWidth + 20), behavior: "smooth" });
  };

  return (
    <section className="relative py-20 md:py-28 bg-ivory overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* heading */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-gold-600 text-xs tracking-[0.3em] uppercase font-body">
            <Instagram size={14} strokeWidth={1.6} />
            Follow Along
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-maroon-950 mt-4">
            @jhanvika_jewelleries
          </h2>
          <p className="text-maroon-900/60 font-body mt-3 max-w-lg mx-auto text-sm md:text-base">
            Step inside our world — new drops, styling ideas and behind-the-scenes
            from the atelier.
          </p>
        </div>

        {/* carousel */}
        <div className="relative">
          {/* left arrow */}
          <button
            onClick={() => scrollByCard(-1)}
            disabled={!canLeft}
            aria-label="Scroll left"
            className={`hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-black/5 transition-opacity ${
              canLeft ? "opacity-100 hover:bg-ivory-deep" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft size={20} className="text-maroon-950" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-6 pb-4 -mx-6 px-6 md:mx-0 md:px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {POSTS.map((post, i) => (
              <PostCard key={i} post={post} index={i} />
            ))}
          </div>

          {/* right arrow */}
          <button
            onClick={() => scrollByCard(1)}
            disabled={!canRight}
            aria-label="Scroll right"
            className={`hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-black/5 transition-opacity ${
              canRight ? "opacity-100 hover:bg-ivory-deep" : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight size={20} className="text-maroon-950" />
          </button>

          {/* mobile scroll hint dots */}
          <div className="flex md:hidden justify-center gap-1.5 mt-4">
            {POSTS.slice(0, 5).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-maroon-900/20" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}