import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#edf8f3', 100: '#d5efe3', 500: '#15805f', 600: '#0f684d', 700: '#0b513d', 800: '#0b3b2e', 900: '#082c23' },
        ink: '#16251f',
        canvas: '#f5f7f5',
        critical: '#c93235',
        high: '#dd6b20',
        medium: '#b7791f',
        low: '#23815d'
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 52, 42, .05), 0 8px 24px rgba(18, 52, 42, .06)',
        lift: '0 16px 40px rgba(8, 44, 35, .16)'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      borderRadius: { '4xl': '2rem' }
    }
  },
  plugins: []
} satisfies Config
