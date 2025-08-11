#!/usr/bin/env node

/**
 * Script pour traiter automatiquement les warnings ESLint restants
 * Traite les cas simples : optional chain expressions et nullish coalescing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Script de correction des warnings ESLint restants');
console.log('================================================\n');

// Fonction pour lire un fichier
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Erreur lecture ${filePath}:`, error.message);
    return null;
  }
}

// Fonction pour écrire un fichier
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Erreur écriture ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour corriger les optional chain expressions
function fixOptionalChain(content) {
  let fixed = content;
  let changes = 0;

  // Pattern: obj && obj.prop → obj?.prop
  const patterns = [
    // i18n && i18n._ → i18n?._
    {
      regex: /(\w+)\s*&&\s*\1\._/g,
      replacement: '$1?._',
      description: 'i18n && i18n._ → i18n?._',
    },
    // hospital && hospital.name → hospital?.name
    {
      regex: /(\w+)\s*&&\s*\1\.(\w+)/g,
      replacement: '$1?.$2',
      description: 'obj && obj.prop → obj?.prop',
    },
  ];

  patterns.forEach(pattern => {
    const matches = fixed.match(pattern.regex);
    if (matches) {
      fixed = fixed.replace(pattern.regex, pattern.replacement);
      changes += matches.length;
      console.log(`  ✅ ${pattern.description}: ${matches.length} corrections`);
    }
  });

  return { content: fixed, changes };
}

// Fonction pour corriger les nullish coalescing restants
function fixNullishCoalescing(content) {
  let fixed = content;
  let changes = 0;

  // Patterns spécifiques pour éviter les faux positifs
  const patterns = [
    // Cas sûrs où || peut être remplacé par ??
    {
      regex: /(\w+\.\w+)\s*\|\|\s*'([^']+)'/g,
      replacement: "$1 ?? '$2'",
      description: "obj.prop || 'default' → obj.prop ?? 'default'",
    },
    {
      regex: /(\w+\.\w+)\s*\|\|\s*"([^"]+)"/g,
      replacement: '$1 ?? "$2"',
      description: 'obj.prop || "default" → obj.prop ?? "default"',
    },
    {
      regex: /(\w+\.\w+)\s*\|\|\s*(\w+)/g,
      replacement: '$1 ?? $2',
      description: 'obj.prop || fallback → obj.prop ?? fallback',
    },
  ];

  patterns.forEach(pattern => {
    const matches = fixed.match(pattern.regex);
    if (matches) {
      fixed = fixed.replace(pattern.regex, pattern.replacement);
      changes += matches.length;
      console.log(`  ✅ ${pattern.description}: ${matches.length} corrections`);
    }
  });

  return { content: fixed, changes };
}

// Liste des fichiers à traiter
const filesToFix = [
  'app/components/ActionBar.tsx',
  'app/components/HospitalDetail.tsx',
  'app/components/HospitalTable.tsx',
  'app/components/Layout.tsx',
  'app/components/NavigationModal.tsx',
  'app/components/TimelineControl.tsx',
  'app/hospitals/[id]/HospitalDetailClient.tsx',
];

let totalChanges = 0;

console.log('📝 Traitement des fichiers...\n');

filesToFix.forEach(filePath => {
  console.log(`🔍 Traitement: ${filePath}`);

  const content = readFile(filePath);
  if (!content) return;

  let currentContent = content;
  let fileChanges = 0;

  // Corriger les optional chain expressions
  const optionalChainResult = fixOptionalChain(currentContent);
  currentContent = optionalChainResult.content;
  fileChanges += optionalChainResult.changes;

  // Corriger les nullish coalescing
  const nullishResult = fixNullishCoalescing(currentContent);
  currentContent = nullishResult.content;
  fileChanges += nullishResult.changes;

  // Sauvegarder si des changements ont été faits
  if (fileChanges > 0) {
    if (writeFile(filePath, currentContent)) {
      console.log(`  💾 Sauvegardé avec ${fileChanges} corrections\n`);
      totalChanges += fileChanges;
    }
  } else {
    console.log(`  ℹ️  Aucune correction nécessaire\n`);
  }
});

console.log('📊 Résumé');
console.log('=========');
console.log(`Total de corrections appliquées: ${totalChanges}`);

if (totalChanges > 0) {
  console.log('\n🧪 Vérification avec ESLint...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n✅ Vérification ESLint terminée');
  } catch (error) {
    console.log('\n⚠️  Des warnings subsistent, vérifiez la sortie ESLint ci-dessus');
  }

  console.log('\n🔧 Formatage du code avec Prettier...');
  try {
    execSync('npm run format', { stdio: 'inherit' });
    console.log('✅ Formatage terminé');
  } catch (error) {
    console.log('⚠️  Erreur lors du formatage, continuez manuellement');
  }
}

console.log('\n🎉 Script terminé !');
console.log('\n📋 Prochaines étapes:');
console.log("1. Vérifiez que l'application fonctionne correctement");
console.log('2. Traitez manuellement les warnings JSX arrow functions restants');
console.log('3. Testez les fonctionnalités affectées');
