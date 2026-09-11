/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  // Energy / category colors are applied via lookup maps, so make sure the
  // utility classes survive purging even though they are built dynamically.
  safelist: [
    {
      pattern:
        /(bg|text|border|ring|from|to)-(violet|sky|amber|slate|emerald|rose|indigo)-(50|100|200|300|400|500|600|700)/,
    },
  ],
  plugins: [],
}
