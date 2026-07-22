/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: "#fbf3f2",
          100: "#f3dedb",
          200: "#e3b6b0",
          300: "#cf8a80",
          400: "#b25d4f",
          500: "#8f3d30",
          600: "#732c21",
          700: "#5c1f18",
          800: "#451712",
          900: "#2e0f0c",
          950: "#1a0806",
        },
        gold: {
          50: "#fdf9ee",
          100: "#faf0cf",
          200: "#f3dd9c",
          300: "#e9c363",
          400: "#dfab3f",
          500: "#c9982f",
          600: "#a97722",
          700: "#87591e",
          800: "#6f471f",
          900: "#5e3c1e",
        },
        ivory: {
          DEFAULT: "#FBF6EC",
          deep: "#F3EAD8",
        },
        emerald: {
          900: "#0d2b22",
          800: "#123b2f",
          700: "#1a4f3f",
        },
        ink: "#20140f",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        script: ["'Tangerine'", "cursive"],
        body: ["'Jost'", "sans-serif"],
      },
      backgroundImage: {
        "gold-foil": "linear-gradient(135deg, #F3DD9C 0%, #C9982F 45%, #EAC873 60%, #8f5f1c 100%)",
        "maroon-fade": "linear-gradient(180deg, #2e0f0c 0%, #5c1f18 100%)",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,152,47,0.35), 0 10px 30px -10px rgba(46,15,12,0.4)",
        glow: "0 0 40px rgba(233,195,99,0.35)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        sparkle: {
          "0%,100%": { opacity: 0, transform: "scale(0.6)" },
          "50%": { opacity: 1, transform: "scale(1.1)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spinSlow 18s linear infinite",
        sparkle: "sparkle 2.2s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};
