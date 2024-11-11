#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function main() {
  // Create necessary directories if they don't exist
  const dirs = [
    'public/icons',
    'public/screenshots',
    'src/types',
    'src/assets/icons'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Run additional setup steps if needed
  if (process.env.NODE_ENV === 'development') {
    console.log('Setting up development environment...');
    try {
      execSync('husky install', { stdio: 'inherit' });
    } catch (error) {
      console.warn('Warning: Husky installation failed. Git hooks will not be installed.');
    }
  }

  console.log('Postinstall completed successfully!');
}

main();