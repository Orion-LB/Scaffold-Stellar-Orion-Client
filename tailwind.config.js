/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        'antic': ['Antic Didone', 'serif'],
        'jakarta': ['Plus Jakarta Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'beau': ['Beau Rivage', 'cursive'],
      },
      colors: {
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "cloud-drift-1": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "cloud-drift-2": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-120%)" },
        },
        "cloud-drift-3": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-80%)" },
        },
        "fade-in-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(60px)" 
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)" 
          },
        },
        "hero-rays": {
          "0%": { opacity: "0.001" },
          "100%": { opacity: "0.75" },
        },
        "hero-word": {
          "0%": { 
            opacity: "0.001",
            filter: "blur(2px)",
            transform: "translateY(5px)"
          },
          "100%": { 
            opacity: "1",
            filter: "blur(0px)",
            transform: "translateY(0)"
          },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cloud-1": "cloud-drift-1 80s linear infinite",
        "cloud-2": "cloud-drift-2 60s linear infinite",
        "cloud-3": "cloud-drift-3 100s linear infinite",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.44, 0, 0.56, 1) forwards",
        "hero-rays": "hero-rays 0.7s cubic-bezier(0.44, 0, 0.56, 1) forwards",
        "hero-word": "hero-word 0.6s cubic-bezier(0.44, 0, 0.56, 1) forwards",
        "marquee": "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  
};
