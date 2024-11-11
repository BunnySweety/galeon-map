import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { argv } from 'process';

const args = argv.slice(2);
const isWatch = args.includes('--watch');
const isCoverage = args.includes('--coverage');

async function runTests() {
  const spinner = ora('Starting tests...').start();
  const startTime = Date.now();

  try {
    // Build test environment
    spinner.text = 'Building test environment...';
    execSync('tsc --noEmit', { stdio: 'inherit' });

    // Run tests
    spinner.text = 'Running tests...';
    const command = [
      'vitest run',
      isWatch ? '--watch' : '',
      isCoverage ? '--coverage' : '',
      '--reporter=verbose'
    ].filter(Boolean).join(' ');
    
    execSync(command, { stdio: 'inherit' });

    // Report results
    const endTime = Date.now();
    const testTime = (endTime - startTime) / 1000;
    
    if (!isWatch) {
      spinner.succeed(chalk.green(
        `All tests passed in ${testTime.toFixed(2)}s`
      ));
      
      if (isCoverage) {
        console.log('\nCoverage report generated in coverage/');
      }
    }

  } catch (error) {
    spinner.fail(chalk.red('Tests failed'));
    console.error(error);
    process.exit(1);
  }
}

function watchTests() {
  console.log(chalk.blue('\nWatch mode enabled\n'));
  console.log('Press', chalk.cyan('a'), 'to run all tests');
  console.log('Press', chalk.cyan('f'), 'to run only failed tests');
  console.log('Press', chalk.cyan('q'), 'to quit watch mode\n');
  
  runTests();
}

isWatch ? watchTests() : runTests();