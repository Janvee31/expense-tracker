export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#ffffff', // Pure white page background
          900: '#ffffff', // Pure white card/panel background
          850: '#fafafa', // Extra light gray surface
          800: '#e4e4e7', // Light gray border (zinc/zinc-200 equivalent)
          750: '#d4d4d8', // Muted borders
          700: '#a1a1aa', // Cool gray text
          650: '#71717a', // Muted text
          600: '#52525b', 
          550: '#3f3f46', 
          500: '#27272a', // Charcoal text
          450: '#18181b', 
          400: '#09090b', // Primary black text
          350: '#000000', 
          300: '#000000', 
          200: '#000000', 
          100: '#000000', 
          50: '#000000',
        },
        cyan: {
          400: '#10b981', // Map cyan to emerald/emerald-500
          500: '#059669',
          600: '#047857',
          300: '#34d399',
          200: '#a7f3d0',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        indigo: {
          400: '#10b981', // Map indigo to emerald/emerald-500
          500: '#059669',
          600: '#047857',
          300: '#34d399',
          200: '#a7f3d0',
          100: '#d1fae5',
          50: '#ecfdf5',
        }
      }
    },
  },
  plugins: [],
}