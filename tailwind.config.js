/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonPink: {
          DEFAULT: '#FF10F0',
          50: '#fff0fe',
          100: '#ffe0fd',
          200: '#ffc2fb',
          300: '#ff8cf7',
          400: '#ff46f3',
          500: '#FF10F0',
          600: '#d900c9',
          700: '#b000a0',
          800: '#900381',
          900: '#750968',
        },
        darkBg: '#050509',
        darkCard: '#0d0d16',
        darkBorder: 'rgba(255, 16, 240, 0.18)',
      },
      boxShadow: {
        'neon': '0 0 25px rgba(255, 16, 240, 0.6), 0 0 50px rgba(255, 16, 240, 0.3)',
        'neon-strong': '0 0 35px #FF10F0, 0 0 70px rgba(255, 16, 240, 0.6), inset 0 0 20px rgba(255, 16, 240, 0.4)',
        'neon-card': '0 8px 32px 0 rgba(255, 16, 240, 0.12)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s infinite',
        'strobe': 'strobe 0.2s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 25px #FF10F0, 0 0 50px rgba(255, 16, 240, 0.5)' },
          '50%': { boxShadow: '0 0 45px #FF10F0, 0 0 90px rgba(255, 16, 240, 0.8), inset 0 0 25px rgba(255, 16, 240, 0.6)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        strobe: {
          '0%, 100%': { backgroundColor: '#ffffff', color: '#000000' },
          '50%': { backgroundColor: '#FF10F0', color: '#ffffff' },
        }
      }
    },
  },
  plugins: [],
}
