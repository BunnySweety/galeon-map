import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

async function buildApp() {
  const spinner = ora('Starting build process...').start();
  const startTime = Date.now();

  try {
    // Clean dist directory
    spinner.text = 'Cleaning dist directory...';
    await fs.emptyDir('dist');

    // Type checking
    spinner.text = 'Running type check...';
    execSync('tsc --noEmit', { stdio: 'inherit' });

    // ESLint
    spinner.text = 'Running ESLint...';
    execSync('eslint src --ext .ts,.tsx --max-warnings 0', { stdio: 'inherit' });

    // Build
    spinner.text = 'Building application...';
    await build();

    // Copy public files
    spinner.text = 'Copying public files...';
    await fs.copy('public', 'dist', {
      filter: (src) => {
        const filename = path.basename(src);
        return !filename.startsWith('.') && filename !== 'index.html';
      }
    });

    // Generate service worker
    spinner.text = 'Generating service worker...';
    await generateServiceWorker();

    // Build complete
    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000;
    
    spinner.succeed(chalk.green(
      `Build completed successfully in ${buildTime.toFixed(2)}s`
    ));

    // Log build size
    await logBuildSize();

  } catch (error) {
    spinner.fail(chalk.red('Build failed'));
    console.error(error);
    process.exit(1);
  }
}

async function generateServiceWorker() {
  const distFiles = await fs.readdir('dist');
  const assets = distFiles.filter(file => !file.endsWith('.map'));
  
  const swContent = `
    const CACHE_NAME = 'hospital-map-v1';
    const ASSETS = ${JSON.stringify(assets)};

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => cache.addAll(ASSETS))
      );
    });
  `;

  await fs.writeFile('dist/sw.js', swContent);
}

async function logBuildSize() {
  const sizes = await calculateBuildSizes();
  console.log('\nBuild sizes:');
  Object.entries(sizes).forEach(([key, size]) => {
    const formattedSize = (size / 1024).toFixed(2) + ' KB';
    console.log(`${chalk.cyan(key.padEnd(30))}${formattedSize}`);
  });
}

async function calculateBuildSizes() {
  const files = await fs.readdir('dist');
  const sizes: Record<string, number> = {};

  for (const file of files) {
    if (file.endsWith('.map')) continue;
    const stats = await fs.stat(`dist/${file}`);
    sizes[file] = stats.size;
  }

  return sizes;
}

buildApp();