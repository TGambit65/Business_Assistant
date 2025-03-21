/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        
        // Original theme colors (preserved)
        "light-bg": "#FFFFFF",  
        "light-text": "#000000",
        "light-sidebar-bg": "#3C82F6",  
        "light-card-bg": "#FAFAFA",
        "light-unread-bg": "#E0E0E0",
        "light-unread-text": "#666666",

        "dark-bg": "#A89882",
        "dark-card-bg": "#3A2E2A",
        "dark-sidebar-bg": "#2F2522",
        "dark-text": "#FFFFFF",
        "dark-preview-text": "#FFD700",
        "dark-border": "#F5A623",

        "category-all": "#000000",
        "category-work": "#4285F4",
        "category-personal": "#34A853",
        "category-urgent": "#EA4335",
        "category-social": "#FBBC05",
        "category-promotions": "#8E44AD",
        "category-updates": "#3498DB",
        "category-forums": "#E67E22",
        "category-newsletters": "#1ABC9C",
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      keyframes: {
        "accordion-down": { from: { height: 0 }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: 0 } },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
