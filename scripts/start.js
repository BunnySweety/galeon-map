import { createServer } from 'vite';
import chalk from 'chalk';
import detectPort from 'detect-port';
import open from 'open';
import { networkInterfaces } from 'os';

async function startDevServer() {
  try {
    // Find available port
    const defaultPort = 3000;
    const port = await detectPort(defaultPort);

    if (port !== defaultPort) {
      console.log(
        chalk.yellow(
          `Port ${defaultPort} is already in use, using port ${port} instead.`
        )
      );
    }

    // Create server
    const server = await createServer({
      configFile: './vite.config.ts',
      server: {
        port,
        host: true,
        open: false, // We'll handle opening browser ourselves
      }
    });

    await server.listen();

    // Log server info
    const networkUrls = getNetworkUrls(port);
    
    console.log(chalk.green('\nDevelopment server started!\n'));
    console.log('Local:            ' + chalk.cyan(`http://localhost:${port}`));
    networkUrls.forEach(url => {
      console.log('On Your Network:    ' + chalk.cyan(url));
    });
    console.log('\nNote that the development build is not optimized.');
    console.log(`To create a production build, run ${chalk.cyan('npm run build')}.\n`);

    // Open in browser
    await open(`http://localhost:${port}`);

  } catch (error) {
    console.error(chalk.red('Failed to start development server:'));
    console.error(error);
    process.exit(1);
  }
}

function getNetworkUrls(port: number): string[] {
  const interfaces = networkInterfaces();
  const urls: string[] = [];

  Object.values(interfaces).forEach(iface => {
    if (!iface) return;
    
    iface.forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        urls.push(`http://${details.address}:${port}`);
      }
    });
  });

  return urls;
}

startDevServer();