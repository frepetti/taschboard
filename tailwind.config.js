import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        amber: {
          ...colors.amber,
          400: '#DA407C', // Beach party
          500: '#6422B8', // Baroque
          600: '#5412A8', // Darker Baroque for hover
        },
        theme: {
          primary: 'var(--theme-primary, #7c3aed)',
          secondary: 'var(--theme-secondary, #4c1d95)',
          accent: 'var(--theme-accent, #ec4899)',
          border: 'var(--theme-border, #334155)',
          'header-bg': 'var(--theme-header-bg, #111318)',
          'header-text': 'var(--theme-header-text, #ffffff)',
        },
        surface: {
          app: 'var(--bg-app)',
          card: 'var(--bg-card)',
          'card-subtle': 'var(--bg-card-subtle)',
        },
        content: {
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
        },
        slate: {
          ...colors.slate,
          700: '#444444',
          800: '#2c2c2c',
          900: '#222222', // Crowshead
          950: '#151515', 
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
        },
        'border-subtle': 'var(--border-subtle)',
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
