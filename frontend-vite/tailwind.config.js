/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#050507',
          surface: '#08090D',
          elevated: '#0C0D12',
          panel: 'rgba(12, 13, 18, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(244, 63, 94, 0.45)',
          'border-subtle': 'rgba(255, 255, 255, 0.05)',
        },
        magenta: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          electric: '#ff2a85',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        techblue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        persona: {
          you: '#38bdf8',
          moderator: '#a855f7',
          aarav: '#3b82f6',
          meera: '#ec4899',
          kabir: '#f97316',
          ananya: '#10b981',
          rohan: '#eab308',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-magenta': '0 0 25px rgba(244, 63, 94, 0.25)',
        'glow-violet': '0 0 25px rgba(139, 92, 246, 0.25)',
        'card': '0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.45)',
        'dock': '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(244, 63, 94, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse': 'spin-reverse 32s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'waveform': 'waveformBounce 0.8s infinite alternate ease-in-out',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'core-pulse': 'corePulse 2.8s infinite ease-in-out',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(244, 63, 94, 0)' },
        },
        corePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        waveformBounce: {
          '0%': { transform: 'scaleY(0.2)' },
          '100%': { transform: 'scaleY(1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

