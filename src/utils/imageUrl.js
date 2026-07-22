// Backend returns image paths as relative ('/uploads/products/xxx.webp') since it
// doesn't know what host the frontend is served from. This resolves them against
// the same API origin every request already uses (VITE_API_URL minus the /api suffix),
// so it works correctly in dev, on a LAN IP, or once deployed — no hardcoded host.
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export function resolveImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  return `${API_ORIGIN}${path}`;
}
