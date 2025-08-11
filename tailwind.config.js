/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Inclut tout dans le dossier app
    // Si vous avez des composants en dehors de /app, ajoutez le chemin ici
    // Par exemple: './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Vous pouvez ajouter des extensions de thème ici si nécessaire plus tard
    },
  },
  plugins: [],
};
