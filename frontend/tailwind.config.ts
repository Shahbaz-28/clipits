import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B5CF6", // Rippl Violet
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#C4B5FD", // Rippl Violet Soft
          foreground: "#08050F",
        },
        accent: {
          DEFAULT: "#3B2A6E", // Rippl Violet Dim
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Rippl Luxury Premium Theme
        rippl: {
          black: "#08050F",
          "black-2": "#0F0A1A",
          "black-3": "#1A1230",
          violet: "#8B5CF6",
          "violet-soft": "#C4B5FD",
          "violet-dim": "#3B2A6E",
          white: "#FFFFFF",
          gray: "#6B7280",
        },
        "vibrant-red-orange": "#FF6B6B",
        "turquoise-accent": "#4ECDC4",
        "sunny-yellow": "#FFE66D",
        "heading-text": "#222222",
        "body-text": "#444444",
        "muted-label": "#6B7280",
      },
      fontFamily: {
        roboto: ["var(--font-roboto)", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem", // Increased from 0.5rem for more rounding
        md: "calc(0.75rem - 2px)", // Adjusted based on new lg
        sm: "calc(0.75rem - 4px)", // Adjusted based on new lg
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
