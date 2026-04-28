import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        coffee: {
          50: "#f9f3ee",
          100: "#f0e3d4",
          200: "#dbc3a8",
          500: "#8b5e3c",
          700: "#5a2d0c",
          900: "#3b1f0f"
        },
        sand: {
          100: "#f7f1e6",
          200: "#eadfce"
        },
        terracotta: {
          500: "#c66a3d"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.625rem",
        sm: "0.5rem"
      }
    }
  },
  plugins: []
};

export default config;
