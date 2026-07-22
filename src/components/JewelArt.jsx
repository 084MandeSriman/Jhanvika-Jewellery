import { useId } from "react";

// Theme -> color palette for procedurally rendered jewel art.
const THEME_COLORS = {
  gold: { stone: "#F3DD9C", stoneDeep: "#C9982F", accent: "#8f5f1c" },
  kundan: { stone: "#FFFBEF", stoneDeep: "#F3DD9C", accent: "#C9982F" },
  emerald: { stone: "#3FA184", stoneDeep: "#0d2b22", accent: "#c9982f" },
  ruby: { stone: "#C1495A", stoneDeep: "#7a1f2b", accent: "#e9c363" },
  pearl: { stone: "#FFF9EE", stoneDeep: "#EFE2C6", accent: "#c9982f" },
  diamond: { stone: "#F3F6FA", stoneDeep: "#C7D3E0", accent: "#9aa9bb" },
  rosegold: { stone: "#F1C6BC", stoneDeep: "#D89586", accent: "#b56a56" },
  polki: { stone: "#FFFDF6", stoneDeep: "#E7D9B0", accent: "#a97722" },
};

/**
 * Renders a stylised, procedurally-generated jewellery illustration.
 * Used in place of photography throughout the dummy catalogue.
 */
export default function JewelArt({ type = "necklace", theme = "gold", className = "", animated = true }) {
  const uid = useId().replace(/:/g, "");
  const c = THEME_COLORS[theme] || THEME_COLORS.gold;

  const goldId = `gold-${uid}`;
  const stoneId = `stone-${uid}`;
  const glowId = `glow-${uid}`;

  const defs = (
    <defs>
      <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FBE9B8" />
        <stop offset="45%" stopColor="#D9A73B" />
        <stop offset="70%" stopColor="#F3DD9C" />
        <stop offset="100%" stopColor="#8f5f1c" />
      </linearGradient>
      <radialGradient id={stoneId} cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor={c.stone} />
        <stop offset="60%" stopColor={c.stoneDeep} />
        <stop offset="100%" stopColor={c.accent} />
      </radialGradient>
      <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );

  const sparkle = animated && (
    <g className="opacity-90">
      <circle cx="72" cy="34" r="2.4" fill="#fff" className="animate-sparkle" style={{ animationDelay: "0.2s" }} />
      <circle cx="30" cy="70" r="1.8" fill="#fff" className="animate-sparkle" style={{ animationDelay: "1s" }} />
      <circle cx="150" cy="60" r="2" fill="#fff" className="animate-sparkle" style={{ animationDelay: "0.6s" }} />
    </g>
  );

  if (type === "necklace") {
    return (
      <svg viewBox="0 0 200 180" className={className} role="img" aria-label="Necklace illustration">
        {defs}
        <path
          d="M20,30 C20,90 60,120 100,120 C140,120 180,90 180,30"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="4"
        />
        {[...Array(9)].map((_, i) => {
          const t = i / 8;
          const x = 20 + t * 160;
          const y = 30 + Math.sin(t * Math.PI) * 78;
          const r = i === 4 ? 13 : 7 + Math.abs(4 - i) * -0.6 + 6;
          return <circle key={i} cx={x} cy={y} r={i === 4 ? 14 : 7} fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1" filter={`url(#${glowId})`} />;
        })}
        <path d="M92,132 L100,152 L108,132 Z" fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1" />
        {sparkle}
      </svg>
    );
  }

  if (type === "earring") {
    return (
      <svg viewBox="0 0 200 180" className={className} role="img" aria-label="Earring illustration">
        {defs}
        <g transform="translate(60,20)">
          <circle cx="0" cy="0" r="7" fill={`url(#${goldId})`} />
          <path d="M0,7 C-22,20 -22,55 0,72 C22,55 22,20 0,7 Z" fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1.5" filter={`url(#${glowId})`} />
          <circle cx="0" cy="86" r="6" fill={`url(#${stoneId})`} />
        </g>
        <g transform="translate(140,20)">
          <circle cx="0" cy="0" r="7" fill={`url(#${goldId})`} />
          <path d="M0,7 C-22,20 -22,55 0,72 C22,55 22,20 0,7 Z" fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1.5" filter={`url(#${glowId})`} />
          <circle cx="0" cy="86" r="6" fill={`url(#${stoneId})`} />
        </g>
        {sparkle}
      </svg>
    );
  }

  if (type === "ring") {
    return (
      <svg viewBox="0 0 200 180" className={className} role="img" aria-label="Ring illustration">
        {defs}
        <ellipse cx="100" cy="120" rx="46" ry="30" fill="none" stroke={`url(#${goldId})`} strokeWidth="9" />
        <polygon points="100,50 122,78 100,106 78,78" fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1.5" filter={`url(#${glowId})`} />
        <polygon points="100,50 122,78 100,68 78,78" fill="#fff" opacity="0.35" />
        {sparkle}
      </svg>
    );
  }

  if (type === "bangle") {
    return (
      <svg viewBox="0 0 200 180" className={className} role="img" aria-label="Bangle illustration">
        {defs}
        <circle cx="100" cy="95" r="62" fill="none" stroke={`url(#${goldId})`} strokeWidth="16" />
        <circle cx="100" cy="95" r="62" fill="none" stroke={c.accent} strokeWidth="1" opacity="0.4" />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 100 + 62 * Math.cos(rad);
          const y = 95 + 62 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="7" fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1" filter={`url(#${glowId})`} />;
        })}
        {sparkle}
      </svg>
    );
  }

  if (type === "mangalsutra") {
    return (
      <svg viewBox="0 0 200 180" className={className} role="img" aria-label="Mangalsutra illustration">
        {defs}
        <path d="M20,30 C20,90 60,120 100,120 C140,120 180,90 180,30" fill="none" stroke="#1a1512" strokeWidth="5" strokeDasharray="2 6" strokeLinecap="round" />
        <path d="M78,120 L100,155 L122,120 Z" fill={`url(#${goldId})`} stroke={c.accent} strokeWidth="1.5" />
        <circle cx="100" cy="138" r="8" fill={`url(#${stoneId})`} filter={`url(#${glowId})`} />
        {sparkle}
      </svg>
    );
  }

  if (type === "nosepin") {
    return (
      <svg viewBox="0 0 200 180" className={className} role="img" aria-label="Nose pin illustration">
        {defs}
        <path d="M100,60 C120,60 130,80 120,95 C112,106 95,106 90,92" fill="none" stroke={`url(#${goldId})`} strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="70" r="10" fill={`url(#${stoneId})`} stroke={c.accent} strokeWidth="1.5" filter={`url(#${glowId})`} />
        {sparkle}
      </svg>
    );
  }

  return null;
}
