/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kid-friendly Roblox-inspired color palette
        'roblox-blue': {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#005bb3',
          700: '#004280',
          800: '#002a4d',
          900: '#00111a'
        },
        'roblox-green': {
          50: '#e6ffe6',
          100: '#b3ffb3',
          200: '#80ff80',
          300: '#4dff4d',
          400: '#1aff1a',
          500: '#00e600',
          600: '#00b300',
          700: '#008000',
          800: '#004d00',
          900: '#001a00'
        },
        'roblox-yellow': {
          50: '#fffde6',
          100: '#fff9b3',
          200: '#fff580',
          300: '#fff14d',
          400: '#ffed1a',
          500: '#ffe600',
          600: '#ccb800',
          700: '#998a00',
          800: '#665c00',
          900: '#332e00'
        },
        'roblox-red': {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#e60000',
          600: '#b30000',
          700: '#800000',
          800: '#4d0000',
          900: '#1a0000'
        },
        'roblox-purple': {
          50: '#f3e6ff',
          100: '#d9b3ff',
          200: '#bf80ff',
          300: '#a64dff',
          400: '#8c1aff',
          500: '#7300e6',
          600: '#5b00b3',
          700: '#420080',
          800: '#2a004d',
          900: '#11001a'
        },
        'roblox-orange': {
          50: '#fff0e6',
          100: '#ffd6b3',
          200: '#ffbc80',
          300: '#ffa24d',
          400: '#ff881a',
          500: '#e66e00',
          600: '#b35500',
          700: '#803c00',
          800: '#4d2400',
          900: '#1a0c00'
        }
      },
      fontFamily: {
        'game': ['Comic Sans MS', 'cursive', 'system-ui'],
        'bold-game': ['Impact', 'Arial Black', 'sans-serif']
      },
      boxShadow: {
        'roblox': '0 8px 16px rgba(0, 0, 0, 0.2)',
        'roblox-hover': '0 12px 24px rgba(0, 0, 0, 0.3)',
        'roblox-pressed': '0 4px 8px rgba(0, 0, 0, 0.2)',
        'neon-blue': '0 0 20px rgba(26, 140, 255, 0.5)',
        'neon-green': '0 0 20px rgba(26, 255, 26, 0.5)',
        'neon-yellow': '0 0 20px rgba(255, 237, 26, 0.5)',
        'neon-purple': '0 0 20px rgba(140, 26, 255, 0.5)'
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'celebrate': 'celebrate 1s ease-in-out'
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(26, 140, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(26, 140, 255, 0.8)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        },
        celebrate: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(5deg)' },
          '50%': { transform: 'scale(1.2) rotate(-5deg)' },
          '75%': { transform: 'scale(1.1) rotate(3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        }
      }
    },
  },
  plugins: [],
};