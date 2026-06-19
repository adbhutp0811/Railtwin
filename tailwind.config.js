/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rail: {
          bg: "#050d1a",
          panel: "#0a1628",
          card: "#0f1f38",
          border: "#1a3a5c",
          accent: "#00d4ff",
          green: "#00ff88",
          yellow: "#ffcc00",
          red: "#ff4444",
          orange: "#ff8800",
          purple: "#8b5cf6",
          text: "#c8d8f0",
          muted: "#4a6080",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      animation: {
        pulse_slow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scan: "scan 2s linear infinite",
        blink: "blink 1.5s step-end infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};