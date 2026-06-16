/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          200: '#ffe48a',
          300: '#f5c518',
          400: '#c89c12'
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px rgba(245, 197, 24, 0.3)',
        neon: '0 0 30px rgba(57, 255, 20, 0.28)'
      },
      backgroundImage: {
        'lucky-gradient': 'linear-gradient(135deg, #0A0E27 0%, #17113d 55%, #060816 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffe48a 0%, #f5c518 45%, #c89c12 100%)',
        'card-glass': 'linear-gradient(180deg, rgba(14, 18, 48, 0.88), rgba(10, 14, 39, 0.72))'
      },
      keyframes: {
        floatStars: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-120px)' }
        },
        slotSpin: {
          '0%': { transform: 'translateY(0)', filter: 'blur(0px)' },
          '25%': { transform: 'translateY(-8px)', filter: 'blur(0.5px)' },
          '50%': { transform: 'translateY(8px)', filter: 'blur(1px)' },
          '75%': { transform: 'translateY(-4px)', filter: 'blur(0.5px)' },
          '100%': { transform: 'translateY(0)', filter: 'blur(0px)' }
        },
        revealPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' }
        }
      },
      animation: {
        floatStars: 'floatStars 18s linear infinite',
        slotSpin: 'slotSpin 0.45s ease-in-out infinite',
        revealPulse: 'revealPulse 1.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
