/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#d6dde1',
        panel: '#ffffff',
        page: '#f1f4f6',
        muted: {
          DEFAULT: '#6c8490',
          foreground: '#8fa5af',
        },
        foreground: '#112b35',
        primary: {
          DEFAULT: '#043541',
          hover: '#074b5c',
        },
        navy: {
          DEFAULT: '#043541',
          2: '#073d49',
          3: '#0a4654',
        },
        blue: {
          dwms: '#079bd8',
        },
        danger: {
          DEFAULT: '#e9282d',
          dark: '#a91d22',
        },
        warning: '#ef5c11',
        success: '#10b981',
        dwms: {
          navy: '#043541',
          blue: '#079bd8',
          page: '#f1f4f6',
          panel: '#ffffff',
          border: '#d6dde1',
          muted: '#6c8490',
          text: '#112b35',
          red: '#e9282d',
          darkRed: '#a91d22',
          orange: '#ef5c11',
        },
      },
    },
  },
  plugins: [],
};
