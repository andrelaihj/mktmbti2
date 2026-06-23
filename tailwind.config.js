/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#1e1b4b',
        },
        dark: {
          bg: '#0B0B0F',
          card: '#1A1A2E',
          elevated: '#27273E',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(from-indigo-500 to-purple-600)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: 1 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
