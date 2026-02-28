/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:  '#FAF8F5',
        ink:     '#2C2B28',
        ash:     '#A09D96',
        rule:    '#D8D4CC',
        glow: {
          a: '#F5EDD8',
          b: '#F0EBE0',
          c: '#EDE7DA',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        input: '-0.02em',
      },
    },
  },
  plugins: [],
}
