import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          dark: "#07070a",
          darker: "#040406",
          elevated: "#0d0a0e",
          card: "#120e14",
          border: "#281e26",
          red: {
            DEFAULT: "#ff1e2d",
            dark: "#b80010",
            deep: "#7a000b",
            glow: "rgba(255, 30, 45, 0.45)",
          },
          yellow: {
            DEFAULT: "#ffc400",
            light: "#ffe066",
            amber: "#ff9900",
            glow: "rgba(255, 196, 0, 0.45)",
          },
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Rajdhani", "Orbitron", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      boxShadow: {
        "bevel-red": "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.6), 0 0 15px rgba(255,30,45,0.35)",
        "bevel-yellow": "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.6), 0 0 18px rgba(255,196,0,0.35)",
        "bevel-glass": "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5)",
        "glow-red": "0 0 25px rgba(255, 30, 45, 0.5)",
        "glow-yellow": "0 0 25px rgba(255, 196, 0, 0.5)",
      },
      keyframes: {
        shockwave: {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        voiceWave: {
          "0%, 100%": { height: "20%" },
          "50%": { height: "100%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        shockwave: "shockwave 0.4s ease-out forwards",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "voice-wave": "voiceWave 0.8s ease-in-out infinite",
        shimmer: "shimmer 6s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
