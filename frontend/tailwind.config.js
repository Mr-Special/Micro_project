/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        claude: {
          terracotta: '#CC5A2B',
          terracottaLight: '#F7ECE6',
          terracottaDark: '#E07A5F',
          terracottaHover: '#B84A20',
          parchment: '#FAF8F5',
          paper: '#FFFFFF',
          subtle: '#F4EFEA',
          border: '#E8E2D8',
          textPrimary: '#1F1E1D',
          textMuted: '#78716C',
          darkBg: '#181715',
          darkCard: '#22201D',
          darkSubtle: '#292723',
          darkBorder: '#34312B',
          darkTextPrimary: '#EDE8E1',
          darkTextMuted: '#A8A29E'
        }
      },
      boxShadow: {
        'claude-sm': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'claude': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'claude-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'claude-warm': '0 8px 30px -4px rgba(204, 90, 43, 0.12)'
      }
    },
  },
  plugins: [],
}
