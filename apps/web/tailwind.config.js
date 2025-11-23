/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Retro Pink Cat Brand Colors
        cat: {
          pink: "#F892B0",        // Main pink (background and facial highlights)
          black: "#231F20",        // Cat outline and main fur
          yellow: "#FFE400",       // Cat eyes and teeth
          darkPink: "#DC5F7F",     // Contrast details, inner ear
          white: "#FFFFFF",        // Teeth highlights
        },
        // Legacy Celo colors (kept for compatibility, can be removed later)
        celo: {
          yellow: "#FFE400",
          green: "#4E632A",
          purple: "#231F20",
          tan: {
            light: "#F892B0",
            medium: "#DC5F7F",
          },
          brown: "#231F20",
          pink: "#F892B0",
          orange: "#F29E5F",
          lime: "#B2EBA1",
          blue: "#8AC0F9",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        alpina: ["var(--font-alpina)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      fontWeight: {
        "750": "750",
      },
      letterSpacing: {
        tight: "-0.05em",
        tighter: "-0.08em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-strong": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-strong": "pulse-strong 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-in": "scale-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
