import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Calm Clinical Precision Tokens
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          border: "var(--surface-border)",
          "border-strong": "var(--surface-border-strong)",
        },
        clinical: {
          teal: {
            DEFAULT: "var(--clinical-teal)",
            hover: "var(--clinical-teal-hover)",
            tint: "var(--clinical-teal-tint)",
            text: "var(--clinical-teal-text)",
          },
          indigo: {
            DEFAULT: "var(--clinical-indigo)",
            text: "var(--clinical-indigo-text)",
            tint: "var(--clinical-indigo-tint)",
          },
        },
        status: {
          critical: {
            DEFAULT: "var(--status-critical)",
            bg: "var(--status-critical-bg)",
            border: "var(--status-critical-border)",
            text: "var(--status-critical-text)",
          },
          high: {
            DEFAULT: "var(--status-high)",
            bg: "var(--status-high-bg)",
            border: "var(--status-high-border)",
            text: "var(--status-high-text)",
          },
          warning: {
            DEFAULT: "var(--status-warning)",
            bg: "var(--status-warning-bg)",
            border: "var(--status-warning-border)",
            text: "var(--status-warning-text)",
          },
          normal: {
            DEFAULT: "var(--status-normal)",
            bg: "var(--status-normal-bg)",
            border: "var(--status-normal-border)",
            text: "var(--status-normal-text)",
          },
          info: {
            DEFAULT: "var(--status-info)",
            bg: "var(--status-info-bg)",
            border: "var(--status-info-border)",
            text: "var(--status-info-text)",
          },
        },

        stress: {
          low: "hsl(var(--stress-low))",
          moderate: "hsl(var(--stress-moderate))",
          high: "hsl(var(--stress-high))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        glass: "hsl(var(--glass-bg) / 0.65)",
        "glass-border": "hsl(var(--glass-border) / 0.2)",
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
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 10px rgba(13, 148, 136, 0.4))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 16px rgba(13, 148, 136, 0.8))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scanline": "scanline 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Devanagari',
          'Noto Sans Kannada',
          'Noto Sans Tamil',
          'Noto Sans Telugu',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
