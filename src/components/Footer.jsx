import { Gem, MapPin, Phone, Mail } from "lucide-react";

const BG = "#360305"; // footer background (also used to "cut out" icon shapes)

/* ---------- inline brand glyphs (no extra icon packages needed) ---------- */
const Instagram = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const XLogo = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const Facebook = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="M13.5 22v-8h2.7l.5-3.2h-3.2V8.7c0-.9.4-1.6 1.7-1.6h1.6V4.3C16.8 4.2 15.8 4 14.7 4c-2.5 0-4.2 1.5-4.2 4.3v2.5H7.7V14h2.8v8h3z" fill={BG} />
  </svg>
);
const Youtube = ({ size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="currentColor" />
    <path d="M10 8.8v6.4l5.4-3.2z" fill={BG} />
  </svg>
);
const WhatsApp = ({ size = 34 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.2 20.8l1.3-4.6A9.2 9.2 0 1 1 8 19.6l-4.8 1.2z" />
    <path d="M9.1 7.9c-.4.2-1 .9-1 1.8 0 2.4 3.9 6.3 6.3 6.3.9 0 1.6-.6 1.8-1 .1-.3 0-.5-.2-.6l-1.7-.8c-.2-.1-.5 0-.6.2l-.5.6c-.2.2-.4.2-.6.1-1-.5-2-1.3-2.5-2.3-.1-.2-.1-.4.1-.6l.5-.6c.1-.2.1-.4 0-.6L9.7 8c-.1-.2-.3-.3-.6-.1z" />
  </svg>
);
const MailEdit = ({ size = 34 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8" />
    <path d="M3.5 7l8.5 6 8.5-6" />
    <path d="M15.5 20.5l.6-2.6 4.4-4.4a1.4 1.4 0 0 1 2 2l-4.4 4.4-2.6.6z" />
  </svg>
);
const ChatBubbles = ({ size = 34 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9.5" cy="9.5" r="6.5" />
    <path d="M4.6 14.1L3.2 18l3.9-1.3" />
    <circle cx="15.2" cy="14.8" r="6.3" fill={BG} />
    <path d="M19.7 19.3l1.5 3-3.4-.9" fill={BG} />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="34" height="34">
    <path d="M3.6 1.5L13.4 12 3.6 22.5C3.3 22.3 3 21.9 3 21.4V2.6c0-.5.3-.9.6-1.1z" fill="#00a0ff" />
    <path d="M3.6 1.5l13.1 7.2-3.3 3.3z" fill="#00e676" />
    <path d="M3.6 22.5l13.1-7.2-3.3-3.3z" fill="#ff3a44" />
    <path d="M16.7 8.7l4.1 2.2c.7.4.7 1.8 0 2.2l-4.1 2.2-3.3-3.3z" fill="#ffd400" />
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
  </svg>
);

/* ---------- QR code (real, scannable matrix; replace the URL by regenerating) ---------- */
function QRCode() {
  return (
    <div className="relative mt-5 w-[160px] h-[160px] sm:w-[172px] sm:h-[172px]">
      <svg viewBox="0 0 33 33" className="w-full h-full" shapeRendering="crispEdges" fill="#fff" role="img" aria-label="QR code to download the Jhanvika app">
        <path d="M0 0h7v1h-7zM8 0h2v1h-2zM13 0h1v1h-1zM16 0h4v1h-4zM21 0h4v1h-4zM26 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM10 1h1v1h-1zM12 1h1v1h-1zM16 1h1v1h-1zM19 1h1v1h-1zM23 1h1v1h-1zM26 1h1v1h-1zM32 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM11 2h2v1h-2zM15 2h1v1h-1zM18 2h1v1h-1zM20 2h1v1h-1zM23 2h2v1h-2zM26 2h1v1h-1zM28 2h3v1h-3zM32 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h2v1h-2zM11 3h1v1h-1zM14 3h1v1h-1zM17 3h3v1h-3zM22 3h1v1h-1zM24 3h1v1h-1zM26 3h1v1h-1zM28 3h3v1h-3zM32 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h3v1h-3zM14 4h1v1h-1zM16 4h1v1h-1zM18 4h3v1h-3zM22 4h2v1h-2zM26 4h1v1h-1zM28 4h3v1h-3zM32 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h2v1h-2zM13 5h2v1h-2zM23 5h2v1h-2zM26 5h1v1h-1zM32 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h1v1h-1zM24 6h1v1h-1zM26 6h7v1h-7zM10 7h4v1h-4zM15 7h1v1h-1zM17 7h2v1h-2zM20 7h2v1h-2zM23 7h1v1h-1zM2 8h1v1h-1zM4 8h3v1h-3zM8 8h2v1h-2zM11 8h1v1h-1zM13 8h2v1h-2zM16 8h1v1h-1zM20 8h2v1h-2zM25 8h1v1h-1zM29 8h1v1h-1zM32 8h1v1h-1zM0 9h1v1h-1zM2 9h2v1h-2zM5 9h1v1h-1zM8 9h3v1h-3zM12 9h2v1h-2zM15 9h1v1h-1zM20 9h2v1h-2zM24 9h1v1h-1zM26 9h1v1h-1zM31 9h2v1h-2zM2 10h1v1h-1zM4 10h1v1h-1zM6 10h4v1h-4zM11 10h2v1h-2zM17 10h1v1h-1zM19 10h1v1h-1zM22 10h1v1h-1zM25 10h1v1h-1zM28 10h5v1h-5zM0 11h1v1h-1zM2 11h1v1h-1zM4 11h2v1h-2zM8 11h4v1h-4zM13 11h2v1h-2zM18 11h1v1h-1zM20 11h2v1h-2zM23 11h4v1h-4zM31 11h2v1h-2zM0 12h2v1h-2zM6 12h1v1h-1zM10 12h2v1h-2zM21 12h1v1h-1zM24 12h3v1h-3zM29 12h1v1h-1zM1 13h2v1h-2zM4 13h1v1h-1zM8 13h1v1h-1zM10 13h1v1h-1zM22 13h1v1h-1zM24 13h1v1h-1zM26 13h1v1h-1zM29 13h1v1h-1zM31 13h2v1h-2zM0 14h1v1h-1zM2 14h2v1h-2zM5 14h5v1h-5zM11 14h1v1h-1zM21 14h1v1h-1zM25 14h1v1h-1zM27 14h3v1h-3zM31 14h2v1h-2zM0 15h1v1h-1zM2 15h2v1h-2zM5 15h1v1h-1zM10 15h2v1h-2zM21 15h3v1h-3zM25 15h1v1h-1zM27 15h3v1h-3zM31 15h2v1h-2zM1 16h2v1h-2zM4 16h3v1h-3zM11 16h1v1h-1zM21 16h3v1h-3zM25 16h2v1h-2zM32 16h1v1h-1zM0 17h1v1h-1zM2 17h3v1h-3zM9 17h1v1h-1zM21 17h1v1h-1zM25 17h2v1h-2zM29 17h2v1h-2zM32 17h1v1h-1zM1 18h3v1h-3zM5 18h3v1h-3zM9 18h1v1h-1zM11 18h1v1h-1zM22 18h1v1h-1zM25 18h1v1h-1zM27 18h2v1h-2zM30 18h3v1h-3zM1 19h1v1h-1zM4 19h2v1h-2zM7 19h3v1h-3zM11 19h1v1h-1zM21 19h2v1h-2zM25 19h2v1h-2zM5 20h3v1h-3zM9 20h2v1h-2zM21 20h1v1h-1zM24 20h1v1h-1zM26 20h1v1h-1zM29 20h1v1h-1zM31 20h2v1h-2zM1 21h2v1h-2zM4 21h1v1h-1zM8 21h1v1h-1zM10 21h1v1h-1zM15 21h3v1h-3zM24 21h3v1h-3zM29 21h4v1h-4zM0 22h1v1h-1zM2 22h1v1h-1zM4 22h1v1h-1zM6 22h3v1h-3zM10 22h1v1h-1zM12 22h3v1h-3zM18 22h2v1h-2zM22 22h1v1h-1zM26 22h3v1h-3zM30 22h3v1h-3zM1 23h1v1h-1zM3 23h1v1h-1zM9 23h4v1h-4zM17 23h3v1h-3zM21 23h2v1h-2zM24 23h2v1h-2zM27 23h1v1h-1zM31 23h2v1h-2zM0 24h1v1h-1zM2 24h3v1h-3zM6 24h1v1h-1zM10 24h1v1h-1zM13 24h1v1h-1zM16 24h1v1h-1zM18 24h1v1h-1zM21 24h1v1h-1zM23 24h6v1h-6zM8 25h1v1h-1zM10 25h3v1h-3zM14 25h5v1h-5zM21 25h1v1h-1zM23 25h2v1h-2zM28 25h1v1h-1zM31 25h2v1h-2zM0 26h7v1h-7zM11 26h4v1h-4zM17 26h1v1h-1zM19 26h1v1h-1zM22 26h3v1h-3zM26 26h1v1h-1zM28 26h2v1h-2zM31 26h2v1h-2zM0 27h1v1h-1zM6 27h1v1h-1zM8 27h1v1h-1zM10 27h1v1h-1zM12 27h1v1h-1zM17 27h1v1h-1zM20 27h2v1h-2zM24 27h1v1h-1zM28 27h1v1h-1zM32 27h1v1h-1zM0 28h1v1h-1zM2 28h3v1h-3zM6 28h1v1h-1zM8 28h3v1h-3zM13 28h3v1h-3zM17 28h1v1h-1zM20 28h1v1h-1zM22 28h1v1h-1zM24 28h5v1h-5zM31 28h1v1h-1zM0 29h1v1h-1zM2 29h3v1h-3zM6 29h1v1h-1zM10 29h2v1h-2zM13 29h1v1h-1zM17 29h2v1h-2zM21 29h1v1h-1zM23 29h1v1h-1zM28 29h1v1h-1zM30 29h3v1h-3zM0 30h1v1h-1zM2 30h3v1h-3zM6 30h1v1h-1zM8 30h2v1h-2zM11 30h1v1h-1zM14 30h1v1h-1zM16 30h2v1h-2zM19 30h3v1h-3zM23 30h1v1h-1zM25 30h1v1h-1zM27 30h2v1h-2zM32 30h1v1h-1zM0 31h1v1h-1zM6 31h1v1h-1zM11 31h1v1h-1zM14 31h2v1h-2zM17 31h1v1h-1zM20 31h2v1h-2zM23 31h2v1h-2zM27 31h1v1h-1zM31 31h1v1h-1zM0 32h7v1h-7zM9 32h2v1h-2zM13 32h1v1h-1zM15 32h2v1h-2zM18 32h1v1h-1zM20 32h2v1h-2zM23 32h2v1h-2zM27 32h2v1h-2zM31 32h2v1h-2z" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center w-[25%] h-[25%]" style={{ backgroundColor: BG }}>
          <Gem size={26} strokeWidth={1.3} />
        </div>
      </div>
    </div>
  );
}

function StoreButton({ icon, small, big }) {
  return (
    <a href="#" className="flex items-center gap-2.5 rounded-lg bg-white/[0.08] px-3.5 py-2 text-left transition-colors hover:bg-white/[0.16]">
      {icon}
      <span className="leading-tight">
        <span className="block text-[0.78rem] text-white/90">{small}</span>
        <span className="block text-[1.2rem] leading-none">{big}</span>
      </span>
    </a>
  );
}

function Razorpay() {
  return (
    <div className="flex h-[52px] w-[200px] items-center justify-center gap-2 rounded-md border border-white/60 bg-black/25">
      <svg viewBox="0 0 24 28" width="20" height="24" aria-hidden>
        <path d="M8 1L1.5 19 7 17l2-6z" fill="#2b83ea" />
        <path d="M9 11l-2 6 5.5-2L5 27 21 8l-7.5 2.5L17 1z" fill="#3fa0ff" />
      </svg>
      <span className="font-sans text-[1.5rem] font-bold italic tracking-tight text-white">Razorpay</span>
    </div>
  );
}

const Heading = ({ children, className = "" }) => (
  <h4 className={`text-xl md:text-[1.65rem] font-medium leading-tight ${className}`}>{children}</h4>
);

const Row = ({ icon, href, children, top }) => {
  const inner = (
    <span className={`flex min-w-0 gap-3 md:gap-4 text-sm md:text-[1.2rem] leading-snug ${top ? "items-start" : "items-center"}`}>
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
  return href ? <a href={href} className="block transition-opacity hover:opacity-80">{inner}</a> : inner;
};

const socials = [
  { label: "Instagram", icon: <Instagram size={22} /> },
  { label: "X", icon: <XLogo size={19} /> },
  { label: "Facebook", icon: <Facebook size={27} /> },
  { label: "YouTube", icon: <Youtube size={27} /> },
];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden font-display text-[#fdf6ee]" style={{ backgroundColor: BG }}>
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />

      <div className="relative mx-auto w-full max-w-[1500px] px-4 sm:px-6 pb-8 pt-9 sm:pt-14 md:px-10 xl:px-14">
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-[1.3fr_1fr_0.95fr_1.15fr] lg:gap-8">

          {/* 1 — Brand + app download */}
          <div className="flex flex-col items-center text-center">
            <Gem size={44} strokeWidth={1.1} className="md:!h-[58px] md:!w-[58px]" />
            <h2 className="mt-1 text-4xl md:text-[3.3rem] font-medium leading-none">Jhanvika</h2>
            <span className="mt-1.5 pl-[0.5em] font-body text-xs md:text-[0.8rem] uppercase tracking-[0.5em]">Jewelleries</span>
            <p className="mt-5 md:mt-6 text-lg md:text-[1.4rem] leading-snug">Download the Jhanvika App Now</p>
            <QRCode />
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-3">
              <StoreButton icon={<PlayIcon />} small="Download on the" big="Play Store" />
              <StoreButton icon={<AppleIcon />} small="Download on the" big="App Store" />
            </div>
          </div>

          {/* 2 — Social + payments */}
          <div className="lg:pt-[4.2rem]">
            <Heading>Social</Heading>
            <div className="mt-5 md:mt-6 flex flex-wrap gap-3 md:gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-white/90 transition-colors hover:bg-white/10"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="mt-9 md:mt-14 text-base md:text-[1.25rem]">Secure Payments by</p>
            <div className="mt-3">
              <Razorpay />
            </div>
          </div>

          {/* 3 — Contact + chat */}
          <div className="lg:pt-[4.2rem]">
            <Heading>Contact Us</Heading>
            <div className="mt-5">
              <Row icon={<Phone size={32} strokeWidth={1.4} />} href="tel:18002966677">1800-296-6677</Row>
            </div>

            <Heading className="mt-9 !text-[1.5rem]">Chat With Us</Heading>
            <div className="mt-4">
              <Row icon={<WhatsApp size={36} />} href="https://wa.me/918147349242">+91 8147349242</Row>
            </div>
            <div className="mt-7 flex items-center gap-9">
              <a href="https://wa.me/918147349242" aria-label="WhatsApp" className="transition-opacity hover:opacity-80"><WhatsApp size={36} /></a>
              <a href="mailto:hello@jhanvikajewelleries.in" aria-label="Email us" className="transition-opacity hover:opacity-80"><MailEdit size={36} /></a>
              <a href="/contact" aria-label="Chat with us" className="transition-opacity hover:opacity-80"><ChatBubbles size={36} /></a>
            </div>
          </div>

          {/* 4 — Visit / Contact */}
          <div className="lg:pt-[4.2rem]">
            <Heading>Visit / Contact</Heading>
            <div className="mt-5 space-y-6">
              <Row top icon={<MapPin size={32} strokeWidth={1.4} />}>
                14 Kalasha Marg, Jaipur,
                <br />
                Rajasthan 302001
              </Row>
              <Row icon={<Phone size={32} strokeWidth={1.4} />} href="tel:+919876543210">+91 98765 43210</Row>
              <Row icon={<Mail size={32} strokeWidth={1.4} />} href="mailto:hello@jhanvikajewelleries.in">hello@jhanvikajewelleries.in</Row>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 text-[1.02rem] md:flex-row">
          <p>© {new Date().getFullYear()} Jhanvika Jewelleries. All rights reserved. This is a demo storefront — all products are illustrative.</p>
          <div className="flex gap-9">
            <a href="#" className="hover:opacity-80">Privacy Policy</a>
            <a href="#" className="hover:opacity-80">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}