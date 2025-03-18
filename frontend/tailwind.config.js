/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        "light-bg": "#FFFFFF",          // Main app background (white)
        "light-text": "#000000",        // Standard black text
        "light-sidebar-bg": "#3C82F6",  // Bright blue for sidebar & header
        "light-card-bg": "#FAFAFA",     // Slightly off-white for email cards
        "light-unread-bg": "#E0E0E0",   // Gray for unread or hover
        "light-unread-text": "#666666",

        // Dark Mode Colors
        "dark-bg": "#A89882",           // Changed from "#D3C7A7" to lighter brown
        "dark-card-bg": "#3A2E2A",
        "dark-sidebar-bg": "#2F2522",
        "dark-text": "#FFFFFF",
        "dark-preview-text": "#FFD700",
        "dark-border": "#F5A623",

        // Category Dot Colors (unchanged)
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
      screens: {
        'xs': '480px',
        // => @media (min-width: 480px) { ... }
      },
    },
  },
  plugins: [],
};
