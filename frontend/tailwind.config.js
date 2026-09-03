/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noc: {
          bg: "#090d16",
          card: "#0f172a",
          cardHover: "#1e293b",
          border: "#1e293b",
          borderGlow: "#334155",
          accent: "#38bdf8",
          critical: "#ef4444",
          criticalGlow: "rgba(239, 68, 68, 0.25)",
          warning: "#f59e0b",
          success: "#10b981",
          purple: "#a855f7"
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'laser-glow': 'laserGlow 2s ease-in-out infinite',
      },
      keyframes: {
        laserGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px #ef4444)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 16px #ef4444)' }
        }
      }
    },
  },
  plugins: [],
}
