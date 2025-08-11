const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(fullPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors for inaccessible directories
  }
  
  return totalSize;
}

function analyzeDependencies() {
  console.log(`${colors.cyan}${colors.bright}📦 DEPENDENCY SIZE ANALYSIS${colors.reset}\n`);
  
  const nodeModulesPath = 'node_modules';
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules directory not found');
    return;
  }
  
  console.log('🔍 Analyzing dependency sizes...\n');
  
  const dependencies = [];
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  // Analyser chaque dépendance
  for (const [depName, version] of Object.entries(allDeps)) {
    const depPath = path.join(nodeModulesPath, depName);
    
    if (fs.existsSync(depPath)) {
      const size = getDirectorySize(depPath);
      const isDev = packageJson.devDependencies && packageJson.devDependencies[depName];
      
      dependencies.push({
        name: depName,
        version: version,
        size: size,
        isDev: isDev,
        type: isDev ? 'dev' : 'prod'
      });
    }
  }
  
  // Trier par taille
  dependencies.sort((a, b) => b.size - a.size);
  
  // Statistiques générales
  const totalSize = dependencies.reduce((sum, dep) => sum + dep.size, 0);
  const prodDeps = dependencies.filter(dep => !dep.isDev);
  const devDeps = dependencies.filter(dep => dep.isDev);
  const prodSize = prodDeps.reduce((sum, dep) => sum + dep.size, 0);
  const devSize = devDeps.reduce((sum, dep) => sum + dep.size, 0);
  
  console.log(`${colors.blue}${colors.bright}📊 DEPENDENCY STATISTICS${colors.reset}`);
  console.log(`📦 Total Dependencies: ${colors.bright}${dependencies.length}${colors.reset}`);
  console.log(`🏭 Production Dependencies: ${colors.bright}${prodDeps.length}${colors.reset} (${formatBytes(prodSize)})`);
  console.log(`🔧 Development Dependencies: ${colors.bright}${devDeps.length}${colors.reset} (${formatBytes(devSize)})`);
  console.log(`💾 Total Size: ${colors.bright}${formatBytes(totalSize)}${colors.reset}`);
  
  // Top 15 plus grosses dépendances
  console.log(`\n${colors.yellow}${colors.bright}🏆 TOP 15 LARGEST DEPENDENCIES${colors.reset}`);
  dependencies.slice(0, 15).forEach((dep, index) => {
    const sizeColor = dep.size > 50 * 1024 * 1024 ? colors.red : 
                     dep.size > 10 * 1024 * 1024 ? colors.yellow : colors.green;
    const typeColor = dep.isDev ? colors.cyan : colors.magenta;
    
    console.log(
      `${index + 1}. ${colors.bright}${dep.name}${colors.reset} ` +
      `${typeColor}[${dep.type}]${colors.reset} - ` +
      `${sizeColor}${formatBytes(dep.size)}${colors.reset} ` +
      `(${dep.version})`
    );
  });
  
  // Analyse des dépendances de production critiques
  console.log(`\n${colors.magenta}${colors.bright}🎯 PRODUCTION DEPENDENCIES ANALYSIS${colors.reset}`);
  const largeProdDeps = prodDeps.filter(dep => dep.size > 5 * 1024 * 1024);
  
  if (largeProdDeps.length > 0) {
    console.log(`⚠️  Large production dependencies (>5MB):`);
    largeProdDeps.forEach(dep => {
      console.log(`   • ${dep.name}: ${formatBytes(dep.size)}`);
    });
  }
  
  // Recommandations d'optimisation
  console.log(`\n${colors.green}${colors.bright}💡 OPTIMIZATION RECOMMENDATIONS${colors.reset}`);
  
  const recommendations = [];
  
  // Analyser les dépendances spécifiques
  const mapboxDep = dependencies.find(dep => dep.name === 'mapbox-gl');
  if (mapboxDep && mapboxDep.size > 20 * 1024 * 1024) {
    recommendations.push(`📍 Mapbox GL (${formatBytes(mapboxDep.size)}) is large. Consider using CDN or tree-shaking.`);
  }
  
  const reactDeps = dependencies.filter(dep => dep.name.includes('react'));
  const reactTotalSize = reactDeps.reduce((sum, dep) => sum + dep.size, 0);
  if (reactTotalSize > 10 * 1024 * 1024) {
    recommendations.push(`⚛️  React ecosystem (${formatBytes(reactTotalSize)}) is large. Ensure proper tree-shaking.`);
  }
  
  const nextDeps = dependencies.filter(dep => dep.name.includes('next'));
  const nextTotalSize = nextDeps.reduce((sum, dep) => sum + dep.size, 0);
  if (nextTotalSize > 30 * 1024 * 1024) {
    recommendations.push(`🔄 Next.js ecosystem (${formatBytes(nextTotalSize)}) is large. Consider optimizing build config.`);
  }
  
  if (largeProdDeps.length > 3) {
    recommendations.push(`⚠️  ${largeProdDeps.length} large production dependencies. Consider alternatives or lazy loading.`);
  }
  
  if (devSize > prodSize * 2) {
    recommendations.push(`🔧 Development dependencies are much larger than production. This is normal but consider cleanup.`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Dependency sizes look reasonable!');
  }
  
  recommendations.forEach(rec => console.log(rec));
  
  // Bundle impact estimation
  console.log(`\n${colors.blue}${colors.bright}📈 ESTIMATED BUNDLE IMPACT${colors.reset}`);
  
  const criticalDeps = [
    'react', 'react-dom', 'next', 'mapbox-gl', '@lingui/react', 
    'framer-motion', 'zustand', '@tanstack/react-query'
  ];
  
  let estimatedBundleSize = 0;
  criticalDeps.forEach(depName => {
    const dep = dependencies.find(d => d.name === depName);
    if (dep) {
      // Estimation approximative : 10-20% de la taille de la dépendance finit dans le bundle
      const estimatedContribution = dep.size * 0.15;
      estimatedBundleSize += estimatedContribution;
      console.log(`${depName}: ~${formatBytes(estimatedContribution)} (from ${formatBytes(dep.size)})`);
    }
  });
  
  console.log(`\n📦 Estimated core bundle size: ${colors.bright}${formatBytes(estimatedBundleSize)}${colors.reset}`);
  
  console.log(`\n${colors.cyan}Dependency analysis complete! 🎉${colors.reset}`);
}

// Exécuter l'analyse
analyzeDependencies(); 