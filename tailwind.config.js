/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.25rem' }],   // dari 12px jadi 14px
        sm: ['1rem', { lineHeight: '1.5rem' }],          // dari 14px jadi 16px
        base: ['1.125rem', { lineHeight: '1.75rem' }],   // dari 16px jadi 18px
      },
    },
  },
  plugins: [],
};
