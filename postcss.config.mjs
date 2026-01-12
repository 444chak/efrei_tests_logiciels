/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // C'est cette ligne qui causait l'erreur
  },
};

export default config;