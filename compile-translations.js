// compile-translations.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Compilation des traductions...');

try {
  // Vérifier si le dossier locales existe
  const localesDir = path.join('locales');
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
    console.log('Dossier locales créé');
  }

  // Vérifier si les fichiers de traduction existent
  const enFile = path.join(localesDir, 'en.json');
  const frFile = path.join(localesDir, 'fr.json');

  // Créer des fichiers de traduction vides s'ils n'existent pas
  if (!fs.existsSync(enFile)) {
    fs.writeFileSync(enFile, '{}');
    console.log('Fichier de traduction en.json créé');
  }

  if (!fs.existsSync(frFile)) {
    fs.writeFileSync(frFile, '{}');
    console.log('Fichier de traduction fr.json créé');
  }

  // Extraire les messages
  console.log('Extraction des messages...');
  execSync('npx lingui extract', { stdio: 'inherit' });

  // Compiler les messages
  console.log('Compiling message catalogs…');
  execSync('npx lingui compile', { stdio: 'inherit' });

  console.log('Done!');
  console.log('Traductions compilées avec succès!');
} catch (error) {
  console.error('Erreur lors de la compilation des traductions:', error);
  process.exit(1);
}
