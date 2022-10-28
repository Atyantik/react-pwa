import { resolve, join } from 'node:path';
import { Command, Option } from 'commander';
import chokidar from 'chokidar';
import {
  getEnvFilePath,
  getReactpwaConfigFilePath,
  getRunOptions,
} from './util.js';

const program = new Command();
const projectRoot = process.cwd();

program
  .name('reactpwa')
  .description('Create & run ReactPWA seamlessly')
  .version('1.0.0');

const modeOption = new Option('-m, --mode <mode>', 'provide the mode to which the code can compile');
modeOption.choices(['development', 'production']);

program.option('-ecf, --env-config-file <path>', 'relative path to .env file', '.env');
program.option('-rcf, --reactpwa-config-file <path>', 'relative path reactpwa.config.js');
program.addOption(modeOption);

program.command('dev')
  .description('Start the current project in development mode')
  .action(async () => {
    // Something to do here now.
    const reactpwaCore = await import ('@reactpwa/core/start');
    let server: Awaited<ReturnType<typeof reactpwaCore.run>>;
    let restartingServer = false;
    const stopServer = (cb: () => void = () => {}) => {
      server.close(cb);
    };
    const startServer = async () => {
      server = await reactpwaCore.run(getRunOptions(program, 'development'));
      restartingServer = false;
    };
    const restartServer = async () => {
      if (restartingServer) {
        return;
      }
      restartingServer = true;
      stopServer(async () => {
        await startServer();
      });
    };
    await startServer();

    const watchPaths = [
      getReactpwaConfigFilePath(program)(),
      getEnvFilePath(program)(),
      `${resolve(projectRoot, 'src', 'public')}`,
      `${resolve(projectRoot, 'src', 'server')}`,
      `${join(projectRoot, 'src', 'server')}.*`,
    ].filter((n) => (typeof n === 'string')) as string[];
    const watcher = chokidar.watch(watchPaths, { ignoreInitial: true });
    watcher.on('all', (_event, path) => {
      if (path.indexOf('/server/') !== -1) {
        // eslint-disable-next-line no-console
        console.info('Changes observed in server or server folder. Restarting Server...');
      }
      if (path.indexOf('/public/') !== -1) {
        // eslint-disable-next-line no-console
        console.info('Changes observed in public folder. Restarting Server...');
      } else {
        // eslint-disable-next-line no-console
        console.info('Changes observed in configurations (env/config). Restarting Server...');
      }
      restartServer();
    });
  });

program.command('build')
  .description('Build the current project')
  .action(async () => {
    // Something to do here now.
    const reactpwaCore = await import ('@reactpwa/core/build');
    reactpwaCore.run(
      getRunOptions(program, 'production'),
    );
  });

program.parse();
