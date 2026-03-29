const paraSalvarTheme = require('./design-system/tailwind-para-salvar.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.vue',
    './layouts/**/*.vue',
  ],
  theme: {
    extend: paraSalvarTheme.extend,
  },
  plugins: [
    ...paraSalvarTheme.plugins,
  ],
}
