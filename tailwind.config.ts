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
        brand: {
          50: '#F4F6FB',
          100: '#E6EAF5',
          200: '#C9D3E9',
          300: '#A1B3D9',
          400: '#6E89C4',
          500: '#4463A7',
          600: '#39538C',
          700: '#2F4574',
          800: '#26385E',
          900: '#1E2B48',
          950: '#131C2F',
        },
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
