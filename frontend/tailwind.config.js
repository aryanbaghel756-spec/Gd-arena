/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121215',
        'surface-elevated': '#18181b',
        border: '#27272a',
        'border-subtle': '#1f1f23',
        primary: {
          DEFAULT: '#38bdf8',
          hover: '#0284c7',
        },
        accent: {
          cyan: '#38bdf8',
          purple: '#a855f7',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        }
      }
    },
  },
  plugins: [],
}
