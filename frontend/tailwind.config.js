/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inkloom: {
          primary: '#7657F6',      // vibrant violet
          primaryHover: '#6343E2',
          secondary: '#478BFF',    // electric blue
          accent: '#FF7B72',       // coral
          highlight: '#53D6B0',    // mint
          bg: '#F7F6FF',           // soft lavender-white
          surface: '#FFFFFF',      // white
          text: '#242044',         // deep indigo
          muted: '#74728C',        // muted slate
          border: '#E8E4F7',       // soft lavender
          warning: '#F4B740',      // warm amber
          error: '#E85C69',        // coral-red
          success: '#239C78',      // emerald
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 8px 30px rgba(118, 87, 246, 0.25)',
        'glow-secondary': '0 8px 30px rgba(71, 139, 255, 0.25)',
        'glow-accent': '0 8px 30px rgba(255, 123, 114, 0.25)',
        'card-soft': '0 4px 20px -2px rgba(36, 32, 68, 0.06), 0 2px 6px -1px rgba(36, 32, 68, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(118, 87, 246, 0.12), 0 4px 12px -2px rgba(36, 32, 68, 0.06)'
      }
    },
  },
  plugins: [],
}
