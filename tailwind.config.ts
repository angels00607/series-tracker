import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8F7FC',
        card: '#FFFFFF',
        primary: { DEFAULT: '#384F95', strong: '#203B6F' },
        secondary: '#8E68A9',
        accent: '#BC7EBF',
        lavender: '#DBC9F9',
        periwinkle: '#A6BAEE',
        text: { DEFAULT: '#312048', soft: '#6B5D80' },
      },
      boxShadow: {
        soft: '0 16px 32px -14px rgba(49, 32, 72, 0.22)',
        card: '0 2px 10px -4px rgba(49, 32, 72, 0.12)',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;
