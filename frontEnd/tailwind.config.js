export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#f8fafc', // Clean light gray body background
          900: '#ffffff', // Clean white panel/card background
          850: '#f1f5f9', // Light gray backgrounds
          800: '#e2e8f0', // Soft gray borders
          750: '#cbd5e1', // Borders/dividers
          700: '#94a3b8', // Medium gray
          650: '#64748b', // Muted text
          600: '#475569', 
          550: '#475569', 
          500: '#334155', 
          450: '#334155', 
          400: '#334155', // Secondary readable text
          350: '#1e293b', 
          300: '#1e293b', 
          200: '#0f172a', // Primary bold text
          100: '#0f172a', 
          50: '#0f172a',
        },
        cyan: {
          400: '#4f46e5', // Deep premium indigo instead of neon cyan
          500: '#3730a3',
          600: '#312e81',
          300: '#6366f1',
          200: '#c7d2fe',
          100: '#e0e7ff',
          50: '#f5f7ff',
        },
        indigo: {
          400: '#6366f1', // Classic premium indigo
          500: '#4f46e5',
          600: '#3730a3',
          300: '#818cf8',
          200: '#c7d2fe',
          100: '#e0e7ff',
          50: '#f5f7ff',
        }
      }
    },
  },
  plugins: [],
}