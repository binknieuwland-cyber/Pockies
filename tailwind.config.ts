import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary navy — from the VS42 crest shield
        ink: {
          50: '#EFF2F8',
          100: '#DCE3F0',
          200: '#B9C7E0',
          300: '#8FA5CB',
          400: '#5D7AA8',
          500: '#3A5787',
          600: '#2C4470',
          700: '#1F3560',
          800: '#172746',
          900: '#111D34',
          950: '#0B1424',
        },
        // Laurel gold — the wreath on the crest
        gold: {
          50: '#FBF6E9',
          100: '#F5EAC7',
          200: '#EBD48F',
          300: '#DEBB5C',
          400: '#CDA23E',
          500: '#B98B2E',
          600: '#996F22',
          700: '#7A581C',
          800: '#5C4215',
          900: '#3E2C0E',
        },
        // Shield red — used sparingly as a heritage accent (not for errors)
        crimson: {
          400: '#C15A4B',
          500: '#A6392C',
          600: '#8A2E23',
          700: '#6E241C',
        },
        // Ledger paper — cool stone-grey, not the usual warm cream
        paper: {
          DEFAULT: '#EEF0E8',
          50: '#F7F8F3',
          100: '#EEF0E8',
          200: '#DEE1D3',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'ui-serif', 'serif'],
        display: ['var(--font-numeral)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        // Shared content width for the app shell (header + main), keeps
        // desktop layouts from stretching edge-to-edge on wide screens.
        app: '85rem', // 1360px
      },
    },
  },
  plugins: [],
}

export default config
