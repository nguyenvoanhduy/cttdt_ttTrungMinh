import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        border: "hsl(var(--border, 214 32% 91%))",
        input: "hsl(var(--input, 214 32% 91%))",
        ring: "hsl(var(--ring, 220 90% 56%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222 47% 11%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 220 90% 56%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 100%))",
          glow: "hsl(var(--primary-glow, 220 90% 70%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 240 4.8% 95.9%))",
          foreground: "hsl(var(--secondary-foreground, 222 47% 11%))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning, 40 90% 60%))",
          foreground: "hsl(var(--warning-foreground, 0 0% 0%))",
        },
        info: {
          DEFAULT: "hsl(var(--info, 200 90% 60%))",
          foreground: "hsl(var(--info-foreground, 0 0% 100%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84% 60%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 100%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 210 40% 96%))",
          foreground: "hsl(var(--muted-foreground, 215 16% 47%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 180 60% 50%))",
          foreground: "hsl(var(--accent-foreground, 0 0% 100%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))",
          foreground: "hsl(var(--popover-foreground, 222 47% 11%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))",
          foreground: "hsl(var(--card-foreground, 222 47% 11%))",
        },
        chat: {
          "bubble-sent": "hsl(var(--chat-bubble-sent, 220 90% 56%))",
          "bubble-sent-fg": "hsl(var(--chat-bubble-sent-foreground, 0 0% 100%))",
          "bubble-received": "hsl(var(--chat-bubble-received, 210 40% 96%))",
          "bubble-received-fg": "hsl(var(--chat-bubble-received-foreground, 222 47% 11%))",
        },
        status: {
          online: "hsl(var(--online, 140 70% 40%))",
          offline: "hsl(var(--offline, 0 0% 60%))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background, 0 0% 98%))",
          foreground: "hsl(var(--sidebar-foreground, 222 47% 11%))",
          primary: "hsl(var(--sidebar-primary, 220 90% 56%))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground, 0 0% 100%))",
          accent: "hsl(var(--sidebar-accent, 180 60% 50%))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground, 0 0% 100%))",
          border: "hsl(var(--sidebar-border, 214 32% 91%))",
          ring: "hsl(var(--sidebar-ring, 220 90% 56%))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;