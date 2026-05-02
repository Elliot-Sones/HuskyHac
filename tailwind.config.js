/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          950: '#04070f',
          900: '#070d1f',
          850: '#080f24',
          800: '#0b1228',
        },
        ocean: {
          DEFAULT: '#0e2c4f',
          glow: '#0a2a55',
        },
        land: {
          DEFAULT: '#5b9c79',
          dark: '#2c5e44',
          supported: '#86b89c',
          teaser: '#6a9d80',
          hover: '#7fb594',
          select: '#d4a64a',
        },
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(.2, .8, .2, 1)',
      },
    },
  },
  plugins: [],
};
