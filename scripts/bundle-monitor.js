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

function saveBundleMetrics(metrics) {
  const metricsDir = '.bundle-metrics';
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir);
  }
  
  const timestamp = new Date().toISOString();
  const filename = path.join(metricsDir, `metrics-${timestamp.split('T')[0]}.json`);
  
  const data = {
    timestamp,
    ...metrics
  };
  
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  return filename;
}

function loadPreviousMetrics() {
  const metricsDir = '.bundle-metrics';
  if (!fs.existsSync(metricsDir)) {
    return null;
  }
  
  const files = fs.readdirSync(metricsDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    return null;
  }
  
  try {
    const latestFile = path.join(metricsDir, files[0]);
    return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  } catch (error) {
    return null;
  }
}

function monitorBundle() {
  console.log(`${colors.cyan}${colors.bright}📊 BUNDLE MONITORING REPORT${colors.reset}\n`);
  
  const buildDir = '.next';
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log(`${colors.red}❌ Build directory not found. Run 'npm run build' first.${colors.reset}`);
    return;
  }
  
  // Collecter les métriques actuelles
  const currentMetrics = {
    totalSize: getDirectorySize(staticDir),
    jsFiles: 0,
    cssFiles: 0,
    chunks: [],
    largestChunk: { name: '', size: 0 }
  };
  
  // Analyser les chunks
  const chunksDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir);
    
    files.forEach(file => {
      const filePath = path.join(chunksDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        if (file.endsWith('.js')) {
          currentMetrics.jsFiles++;
          currentMetrics.chunks.push({
            name: file,
            size: stats.size
          });
          
          if (stats.size > currentMetrics.largestChunk.size) {
            currentMetrics.largestChunk = {
              name: file,
              size: stats.size
            };
          }
        } else if (file.endsWith('.css')) {
          currentMetrics.cssFiles++;
        }
      }
    });
  }
  
  // Trier les chunks par taille
  currentMetrics.chunks.sort((a, b) => b.size - a.size);
  
  // Charger les métriques précédentes
  const previousMetrics = loadPreviousMetrics();
  
  // Afficher les métriques actuelles
  console.log(`${colors.blue}${colors.bright}📈 CURRENT METRICS${colors.reset}`);
  console.log(`📦 Total Bundle Size: ${colors.bright}${formatBytes(currentMetrics.totalSize)}${colors.reset}`);
  console.log(`📄 JavaScript Files: ${colors.bright}${currentMetrics.jsFiles}${colors.reset}`);
  console.log(`🎨 CSS Files: ${colors.bright}${currentMetrics.cssFiles}${colors.reset}`);
  console.log(`🏆 Largest Chunk: ${colors.bright}${currentMetrics.largestChunk.name}${colors.reset} (${formatBytes(currentMetrics.largestChunk.size)})`);
  
  // Comparer avec les métriques précédentes
  if (previousMetrics) {
    console.log(`\n${colors.yellow}${colors.bright}📊 COMPARISON WITH PREVIOUS BUILD${colors.reset}`);
    
    const sizeDiff = currentMetrics.totalSize - previousMetrics.totalSize;
    const sizePercent = ((sizeDiff / previousMetrics.totalSize) * 100).toFixed(2);
    
    const sizeColor = sizeDiff > 0 ? colors.red : sizeDiff < 0 ? colors.green : colors.yellow;
    const sizeSymbol = sizeDiff > 0 ? '📈' : sizeDiff < 0 ? '📉' : '➡️';
    
    console.log(`${sizeSymbol} Bundle Size: ${sizeColor}${sizeDiff > 0 ? '+' : ''}${formatBytes(sizeDiff)}${colors.reset} (${sizePercent}%)`);
    
    const filesDiff = currentMetrics.jsFiles - previousMetrics.jsFiles;
    const filesColor = filesDiff > 0 ? colors.red : filesDiff < 0 ? colors.green : colors.yellow;
    console.log(`📄 JS Files: ${filesColor}${filesDiff > 0 ? '+' : ''}${filesDiff}${colors.reset}`);
    
    // Alertes
    console.log(`\n${colors.magenta}${colors.bright}🚨 ALERTS${colors.reset}`);
    
    const alerts = [];
    
    if (sizeDiff > 500 * 1024) { // Plus de 500KB d'augmentation
      alerts.push(`⚠️  Bundle size increased by ${formatBytes(sizeDiff)} (${sizePercent}%)`);
    }
    
    if (currentMetrics.totalSize > 5 * 1024 * 1024) { // Plus de 5MB
      alerts.push(`⚠️  Bundle size exceeds 5MB threshold`);
    }
    
    if (currentMetrics.largestChunk.size > 2 * 1024 * 1024) { // Chunk plus de 2MB
      alerts.push(`⚠️  Largest chunk exceeds 2MB: ${currentMetrics.largestChunk.name}`);
    }
    
    if (filesDiff > 5) {
      alerts.push(`⚠️  Number of JS files increased by ${filesDiff}`);
    }
    
    if (alerts.length === 0) {
      alerts.push(`✅ No alerts - bundle metrics look good!`);
    }
    
    alerts.forEach(alert => console.log(alert));
  }
  
  // Top 5 des plus gros chunks
  console.log(`\n${colors.green}${colors.bright}🏆 TOP 5 LARGEST CHUNKS${colors.reset}`);
  currentMetrics.chunks.slice(0, 5).forEach((chunk, index) => {
    const sizeColor = chunk.size > 1024 * 1024 ? colors.red : 
                     chunk.size > 500 * 1024 ? colors.yellow : colors.green;
    console.log(`${index + 1}. ${chunk.name} - ${sizeColor}${formatBytes(chunk.size)}${colors.reset}`);
  });
  
  // Recommandations basées sur les métriques
  console.log(`\n${colors.blue}${colors.bright}💡 RECOMMENDATIONS${colors.reset}`);
  
  const recommendations = [];
  
  if (currentMetrics.totalSize > 4 * 1024 * 1024) {
    recommendations.push('Consider implementing code splitting to reduce bundle size');
  }
  
  if (currentMetrics.largestChunk.size > 1.5 * 1024 * 1024) {
    recommendations.push(`Largest chunk (${currentMetrics.largestChunk.name}) should be split`);
  }
  
  if (currentMetrics.jsFiles > 40) {
    recommendations.push('Consider bundling optimization to reduce number of JS files');
  }
  
  const largeChunks = currentMetrics.chunks.filter(chunk => chunk.size > 500 * 1024);
  if (largeChunks.length > 3) {
    recommendations.push(`${largeChunks.length} chunks are larger than 500KB`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Bundle metrics are within acceptable ranges');
  }
  
  recommendations.forEach(rec => console.log(`• ${rec}`));
  
  // Sauvegarder les métriques actuelles
  const savedFile = saveBundleMetrics(currentMetrics);
  console.log(`\n${colors.cyan}📁 Metrics saved to: ${savedFile}${colors.reset}`);
  
  // Performance score estimation
  let score = 100;
  if (currentMetrics.totalSize > 5 * 1024 * 1024) score -= 30;
  else if (currentMetrics.totalSize > 3 * 1024 * 1024) score -= 20;
  else if (currentMetrics.totalSize > 2 * 1024 * 1024) score -= 10;
  
  if (currentMetrics.largestChunk.size > 2 * 1024 * 1024) score -= 20;
  else if (currentMetrics.largestChunk.size > 1 * 1024 * 1024) score -= 10;
  
  const scoreColor = score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;
  console.log(`\n${colors.bright}🎯 Performance Score: ${scoreColor}${score}/100${colors.reset}`);
  
  console.log(`\n${colors.cyan}Bundle monitoring complete! 🎉${colors.reset}`);
}

// Exécuter le monitoring
monitorBundle(); 