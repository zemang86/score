/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bright, fresh, kid-friendly color palette
        primary: {
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
        secondary: {
          50: '#e8f5e8',
          100: '#c3e6c3',
          200: '#9dd69d',
          300: '#77c677',
          400: '#51b651',
          500: '#2ba02b',
          600: '#228022',
          700: '#1a601a',
          800: '#114011',
          900: '#082008'
        },
        accent: {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffdf80',
          300: '#ffd24d',
          400: '#ffc51a',
          500: '#ffb800',
          600: '#cc9300',
          700: '#996e00',
          800: '#664a00',
          900: '#332500'
        },
        success: {
          50: '#e8f5e8',
          100: '#c3e6c3',
          200: '#9dd69d',
          300: '#77c677',
          400: '#51b651',
          500: '#2ba02b',
          600: '#228022',
          700: '#1a601a',
          800: '#114011',
          900: '#082008'
        },
        warning: {
          50: '#fff4e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb84d',
          400: '#ffa41a',
          500: '#ff9000',
          600: '#cc7300',
          700: '#995600',
          800: '#663a00',
          900: '#331d00'
        },
        error: {
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
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        }
      },
      fontFamily: {
        // Modern, friendly typography
        'sans': ['Poppins', 'Nunito', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'display': ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'body': ['Nunito', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.6' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }]
      },
      spacing: {
        // 8px spacing system
        '18': '4.5rem',
        '88': '22rem'
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem'
      },
      boxShadow: {
        // Soft, playful shadows
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 16px 32px rgba(0, 0, 0, 0.15)',
        'fun': '0 4px 20px rgba(26, 140, 255, 0.2)',
        'success': '0 4px 20px rgba(43, 160, 43, 0.2)',
        'warning': '0 4px 20px rgba(255, 144, 0, 0.2)',
        'error': '0 4px 20px rgba(230, 0, 0, 0.2)'
      },
      animation: {
        // Subtle, delightful animations
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out'
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      backdropBlur: {
        'xs': '2px'
      }
    },
  },
  plugins: [],
};