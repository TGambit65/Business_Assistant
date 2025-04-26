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

        // Network status colors
        "network-status-connected": "var(--network-status-connected)", // Keep existing vars
        "network-status-connected-text": "var(--network-status-connected-text)", // Keep existing vars
        "network-status-poor": "var(--network-status-poor)", // Keep existing vars
        "network-status-poor-text": "var(--network-status-poor-text)", // Keep existing vars
        "network-status-offline": "var(--network-status-offline)", // Keep existing vars
        "network-status-offline-text": "var(--network-status-offline-text)", // Keep existing vars

        // PWA installation prompt
        "install-prompt-bg": "var(--install-prompt-bg)", // Keep existing vars
        "install-prompt-text": "var(--install-prompt-text)", // Keep existing vars
        "install-prompt-border": "var(--install-prompt-border)", // Keep existing vars
        "install-prompt-button": "var(--install-prompt-button)", // Keep existing vars
        "install-prompt-button-text": "var(--install-prompt-button-text)", // Keep existing vars

        // Chart colors
        "chart-1": "hsl(var(--chart-1))", // Keep existing vars
        "chart-2": "hsl(var(--chart-2))", // Keep existing vars
        "chart-3": "hsl(var(--chart-3))", // Keep existing vars
        "chart-4": "hsl(var(--chart-4))", // Keep existing vars

        // --- NEW UI Improvement Palette ---
        'brand-blue': '#3B82F6',
        'neutral-50': '#F9FAFB',  // Off-white
        'neutral-100': '#F3F4F6', // Light gray bg
        'neutral-200': '#E5E7EB', // Borders / light gray bg
        'neutral-600': '#6B7280', // Gray text
        'neutral-800': '#1F2937', // Dark Gray text
        'status-green': '#10B981',
        'status-red': '#EF4444',
        'status-yellow': '#F59E0B',
        'dark-bg-alt': '#374151', // Alternative dark background (Cool Gray)
        'dark-bg-earth': '#4B3F38', // Earth tone dark background (Deep Brown)
        // --- END NEW UI Improvement Palette ---

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

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": { from: { height: 0 }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: 0 } },
        "pulse-opacity": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.5 } },
        "slide-in-right": { "0%": { transform: "translateX(100%)" }, "100%": { transform: "translateX(0)" } },
        "slide-out-right": { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(100%)" } },
        "fade-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        "fade-out": { "0%": { opacity: 1 }, "100%": { opacity: 0 } },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-opacity": "pulse-opacity 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-in",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-in",
      },

      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },

      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
