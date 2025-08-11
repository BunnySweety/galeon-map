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

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function analyzeDirectory(dirPath, prefix = '') {
  const items = [];
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        const subItems = analyzeDirectory(fullPath, prefix + '  ');
        items.push({
          name: file,
          type: 'directory',
          size: subItems.reduce((total, item) => total + item.size, 0),
          items: subItems
        });
      } else {
        items.push({
          name: file,
          type: 'file',
          size: stats.size,
          path: fullPath
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
  
  return items.sort((a, b) => b.size - a.size);
}

function printAnalysis(items, prefix = '', maxItems = 10) {
  items.slice(0, maxItems).forEach((item, index) => {
    const sizeColor = item.size > 1024 * 1024 ? colors.red : 
                     item.size > 100 * 1024 ? colors.yellow : colors.green;
    
    console.log(
      `${prefix}${item.type === 'directory' ? '📁' : '📄'} ${colors.bright}${item.name}${colors.reset} - ${sizeColor}${formatBytes(item.size)}${colors.reset}`
    );
    
    if (item.type === 'directory' && item.items && item.items.length > 0) {
      printAnalysis(item.items, prefix + '  ', 5);
    }
  });
}

function analyzeBundleMetrics() {
  console.log(`${colors.cyan}${colors.bright}🔍 GALEON COMMUNITY HOSPITAL MAP - BUNDLE ANALYSIS${colors.reset}\n`);
  
  const buildDir = '.next';
  const staticDir = path.join(buildDir, 'static');
  const chunksDir = path.join(staticDir, 'chunks');
  
  // Analyse des chunks principaux
  console.log(`${colors.blue}${colors.bright}📦 CHUNKS ANALYSIS${colors.reset}`);
  if (fs.existsSync(chunksDir)) {
    const chunks = analyzeDirectory(chunksDir);
    printAnalysis(chunks, '', 15);
  }
  
  console.log(`\n${colors.blue}${colors.bright}📊 BUNDLE METRICS${colors.reset}`);
  
  // Métriques principales
  const metrics = {
    totalBundleSize: 0,
    largestChunks: [],
    jsFiles: 0,
    cssFiles: 0,
    mapFiles: 0,
    otherFiles: 0
  };
  
  function collectMetrics(items) {
    items.forEach(item => {
      if (item.type === 'file') {
        metrics.totalBundleSize += item.size;
        
        if (item.name.endsWith('.js')) {
          metrics.jsFiles++;
          if (item.size > 50 * 1024) { // Plus de 50KB
            metrics.largestChunks.push({
              name: item.name,
              size: item.size
            });
          }
        } else if (item.name.endsWith('.css')) {
          metrics.cssFiles++;
        } else if (item.name.endsWith('.map')) {
          metrics.mapFiles++;
        } else {
          metrics.otherFiles++;
        }
      } else if (item.items) {
        collectMetrics(item.items);
      }
    });
  }
  
  if (fs.existsSync(staticDir)) {
    const staticItems = analyzeDirectory(staticDir);
    collectMetrics(staticItems);
  }
  
  // Affichage des métriques
  console.log(`📏 Total Bundle Size: ${colors.bright}${formatBytes(metrics.totalBundleSize)}${colors.reset}`);
  console.log(`📄 JavaScript Files: ${colors.bright}${metrics.jsFiles}${colors.reset}`);
  console.log(`🎨 CSS Files: ${colors.bright}${metrics.cssFiles}${colors.reset}`);
  console.log(`🗺️  Source Maps: ${colors.bright}${metrics.mapFiles}${colors.reset}`);
  console.log(`📋 Other Files: ${colors.bright}${metrics.otherFiles}${colors.reset}`);
  
  // Top chunks les plus volumineux
  console.log(`\n${colors.yellow}${colors.bright}🏆 LARGEST CHUNKS (>50KB)${colors.reset}`);
  metrics.largestChunks
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((chunk, index) => {
      const sizeColor = chunk.size > 500 * 1024 ? colors.red : 
                       chunk.size > 200 * 1024 ? colors.yellow : colors.green;
      console.log(`${index + 1}. ${chunk.name} - ${sizeColor}${formatBytes(chunk.size)}${colors.reset}`);
    });
  
  // Recommandations
  console.log(`\n${colors.magenta}${colors.bright}💡 OPTIMIZATION RECOMMENDATIONS${colors.reset}`);
  
  const recommendations = [];
  
  if (metrics.totalBundleSize > 2 * 1024 * 1024) {
    recommendations.push('⚠️  Bundle size is large (>2MB). Consider code splitting.');
  }
  
  const largeChunks = metrics.largestChunks.filter(chunk => chunk.size > 500 * 1024);
  if (largeChunks.length > 0) {
    recommendations.push(`⚠️  ${largeChunks.length} chunks are very large (>500KB). Consider splitting them.`);
  }
  
  if (metrics.jsFiles > 50) {
    recommendations.push('⚠️  Many JavaScript files. Consider bundling optimization.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Bundle size looks good! No major optimizations needed.');
  }
  
  recommendations.forEach(rec => console.log(rec));
  
  // Performance Score
  console.log(`\n${colors.green}${colors.bright}🎯 PERFORMANCE SCORE${colors.reset}`);
  let score = 100;
  
  if (metrics.totalBundleSize > 3 * 1024 * 1024) score -= 30;
  else if (metrics.totalBundleSize > 2 * 1024 * 1024) score -= 20;
  else if (metrics.totalBundleSize > 1 * 1024 * 1024) score -= 10;
  
  if (largeChunks.length > 3) score -= 20;
  else if (largeChunks.length > 1) score -= 10;
  
  if (metrics.jsFiles > 100) score -= 15;
  else if (metrics.jsFiles > 50) score -= 10;
  
  const scoreColor = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
  console.log(`Bundle Performance Score: ${scoreColor}${colors.bright}${score}/100${colors.reset}`);
  
  console.log(`\n${colors.cyan}Analysis complete! 🎉${colors.reset}`);
}

// Exécuter l'analyse
analyzeBundleMetrics(); 