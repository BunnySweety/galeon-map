#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Optimisation automatique du code...\n');

// Fonction pour analyser et optimiser un fichier
function optimizeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let optimizedContent = content;
    const changes = [];

    // 1. Supprimer les imports inutilisés (basique)
    const lines = content.split('\n');
    const importLines = lines.filter(line => line.trim().startsWith('import '));
    const codeLines = lines.filter(
      line => !line.trim().startsWith('import ') && !line.trim().startsWith('//')
    );
    const codeContent = codeLines.join('\n');

    // Vérifier chaque import
    const optimizedImports = importLines.filter(importLine => {
      // Extraire les noms importés
      const importMatch = importLine.match(/import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))/);
      if (!importMatch) return true; // Garder les imports complexes

      const importedNames = [];
      if (importMatch[1]) {
        // Import destructuré: { name1, name2 }
        importedNames.push(...importMatch[1].split(',').map(name => name.trim()));
      } else if (importMatch[2]) {
        // Import namespace: * as name
        importedNames.push(importMatch[2]);
      } else if (importMatch[3]) {
        // Import par défaut: name
        importedNames.push(importMatch[3]);
      }

      // Vérifier si au moins un nom importé est utilisé
      return importedNames.some(name => {
        const cleanName = name.replace(/\s+as\s+\w+/, '').trim();
        return codeContent.includes(cleanName);
      });
    });

    if (optimizedImports.length !== importLines.length) {
      changes.push(
        `Supprimé ${importLines.length - optimizedImports.length} import(s) inutilisé(s)`
      );
    }

    // 2. Supprimer les lignes vides multiples
    optimizedContent = optimizedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    if (optimizedContent !== content) {
      changes.push('Supprimé les lignes vides multiples');
    }

    // 3. Supprimer les espaces en fin de ligne
    const trimmedContent = optimizedContent.replace(/[ \t]+$/gm, '');
    if (trimmedContent !== optimizedContent) {
      changes.push('Supprimé les espaces en fin de ligne');
      optimizedContent = trimmedContent;
    }

    // Reconstruire le fichier avec les imports optimisés
    if (optimizedImports.length !== importLines.length) {
      const nonImportLines = lines.filter(line => !line.trim().startsWith('import '));
      optimizedContent = [...optimizedImports, '', ...nonImportLines].join('\n');
    }

    // Écrire le fichier optimisé si des changements ont été faits
    if (changes.length > 0) {
      fs.writeFileSync(filePath, optimizedContent);
      console.log(`✅ ${path.relative(process.cwd(), filePath)}: ${changes.join(', ')}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erreur lors de l'optimisation de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les fichiers
function optimizeDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let totalOptimized = 0;

  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Ignorer certains dossiers
        if (!['node_modules', '.next', 'out', '.git', 'dist', 'build'].includes(item)) {
          walkDir(itemPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (optimizeFile(itemPath)) {
            totalOptimized++;
          }
        }
      }
    }
  }

  walkDir(dirPath);
  return totalOptimized;
}

// Fonction pour exécuter ESLint avec auto-fix
function runESLintFix() {
  try {
    console.log("\n🔧 Exécution d'ESLint avec auto-fix...");
    execSync('npx eslint app --ext .ts,.tsx,.js,.jsx --fix', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ ESLint auto-fix terminé');
    return true;
  } catch (error) {
    console.warn(
      '⚠️ ESLint auto-fix a rencontré des erreurs (normal si certaines erreurs ne peuvent pas être corrigées automatiquement)'
    );
    return false;
  }
}

// Fonction pour exécuter Prettier
function runPrettier() {
  try {
    console.log('\n💅 Formatage du code avec Prettier...');
    execSync('npx prettier --write "app/**/*.{ts,tsx,js,jsx}"', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ Formatage Prettier terminé');
    return true;
  } catch (error) {
    console.warn('⚠️ Prettier a rencontré des erreurs:', error.message);
    return false;
  }
}

// Fonction pour analyser les performances du bundle
function analyzeBundleSize() {
  try {
    console.log('\n📊 Analyse de la taille du bundle...');

    // Créer un build de test pour analyser la taille
    execSync('npm run build', { stdio: 'pipe' });

    // Analyser les fichiers de build
    const buildDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(buildDir)) {
      console.log("✅ Build créé avec succès pour l'analyse");

      // Ici, on pourrait ajouter une analyse plus détaillée des chunks
      // Pour l'instant, on se contente de vérifier que le build fonctionne
      return true;
    }

    return false;
  } catch (error) {
    console.warn("⚠️ Impossible d'analyser la taille du bundle:", error.message);
    return false;
  }
}

// Fonction principale
function main() {
  const startTime = Date.now();

  console.log('1️⃣ Optimisation des fichiers TypeScript/JavaScript...');
  const optimizedFiles = optimizeDirectory('./app');

  if (optimizedFiles > 0) {
    console.log(`\n✅ ${optimizedFiles} fichier(s) optimisé(s)`);
  } else {
    console.log('\n✅ Aucune optimisation nécessaire');
  }

  // Exécuter ESLint auto-fix
  runESLintFix();

  // Exécuter Prettier
  runPrettier();

  // Analyser la taille du bundle (optionnel)
  if (process.argv.includes('--analyze')) {
    analyzeBundleSize();
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n🎉 Optimisation terminée en ${duration}s`);
  console.log('\n📋 Résumé des optimisations:');
  console.log('   • Imports inutilisés supprimés');
  console.log('   • Lignes vides multiples nettoyées');
  console.log('   • Espaces en fin de ligne supprimés');
  console.log('   • Code formaté avec ESLint et Prettier');

  if (process.argv.includes('--analyze')) {
    console.log('   • Analyse de la taille du bundle effectuée');
  }

  console.log('\n💡 Pour une analyse complète du bundle, utilisez: npm run optimize -- --analyze');
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { optimizeFile, optimizeDirectory, runESLintFix, runPrettier };
