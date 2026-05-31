import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft kawaii palette
        rose: {
          DEFAULT: "#f7b8cf",
          soft: "#fcd9e5",
          deep: "#e98aab",
        },
        lavender: {
          DEFAULT: "#cdb8f0",
          soft: "#e6dcfb",
          deep: "#a98ce0",
        },
        cream: "#fff8f4",
        mint: "#bdeede",
        sky: "#bfe0f7",
        ink: "#5a4a55",
      },
      fontFamily: {
        sans: ["var(--font-rounded)", "Quicksand", "Nunito", "system-ui", "sans-serif"],
        display: ["var(--font-rounded)", "Quicksand", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        blob: "2.5rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(180, 130, 165, 0.35)",
        glass: "0 8px 32px 0 rgba(180, 130, 165, 0.18)",
        glow: "0 0 24px -4px rgba(247, 184, 207, 0.7)",
      },
      backgroundImage: {
        "kawaii-gradient":
          "linear-gradient(135deg, #fcd9e5 0%, #e6dcfb 50%, #bfe0f7 100%)",
        // Soft, low-opacity background glows so they stay subtle on the cream bg
        "kawaii-radial":
          "radial-gradient(circle at 18% 12%, rgba(252,217,229,0.40) 0%, transparent 38%), radial-gradient(circle at 85% 25%, rgba(230,220,251,0.38) 0%, transparent 40%), radial-gradient(circle at 50% 92%, rgba(189,238,222,0.32) 0%, transparent 42%)",
        "kawaii-radial-dark":
          "radial-gradient(circle at 18% 12%, rgba(233,138,171,0.16) 0%, transparent 38%), radial-gradient(circle at 85% 25%, rgba(169,140,224,0.16) 0%, transparent 40%), radial-gradient(circle at 50% 92%, rgba(189,238,222,0.10) 0%, transparent 42%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
