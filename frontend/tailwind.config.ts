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
          DEFAULT: "#FF6B6B", // Vibrant Red-Orange
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#4ECDC4", // Turquoise
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFE66D", // Sunny Yellow
          foreground: "#222222",
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
        // Custom theme colors
        "main-bg": "#FFFFFF",
        "section-bg": "#F7F7F7",
        "vibrant-red-orange": "#FF6B6B",
        "turquoise-accent": "#4ECDC4",
        "sunny-yellow": "#FFE66D",
        "heading-text": "#222222",
        "body-text": "#444444",
        "muted-label": "#6B7280",
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
