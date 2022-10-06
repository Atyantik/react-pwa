import { isAbsolute, resolve, extname } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { Command, Option } from 'commander';
import { parse } from 'dotenv';
import { expand } from 'dotenv-expand';
import chokidar from 'chokidar';

const program = new Command();

program
  .name('reactpwa')
  .description('Create & run ReactPWA seamlessly')
  .version('1.0.0');

const modeOption = new Option('-m, --mode <mode>', 'provide the mode to which the code can compile');
modeOption.choices(['development', 'production']);

program.option('-ecf, --env-config-file <path>', 'relative path to .env file', '.env');
program.option('-rcf, --reactpwa-config-file <path>', 'relative path reactpwa.config.js');
program.addOption(modeOption);

const getEnvFilePath = (): false | string => {
  const { envConfigFile } = program.opts();
  if (!envConfigFile) {
    return false;
  }
  let absolutePath = envConfigFile;
  if (!isAbsolute(envConfigFile)) {
    absolutePath = resolve(process.cwd(), envConfigFile);
  }
  if (existsSync(absolutePath)) {
    return absolutePath;
  }
  return false;
};

const getEnvVars = (): Record<string, any> => {
  const { envConfigFile } = program.opts();
  const envFilePath = getEnvFilePath();
  if (!envFilePath) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Unable to resolve path ${envConfigFile}`);
    return {};
  }
  try {
    const envData = readFileSync(envFilePath, { encoding: 'utf-8' });
    return expand(parse(envData));
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
  }
  return {};
};

const getReactpwaConfigFilePath = (): string | false => {
  const { reactpwaConfigFile } = program.opts();
  let absolutePath = reactpwaConfigFile;
  if (!reactpwaConfigFile) {
    // check if root file reactpwa.config.json exists
    const defaultConfigPath = resolve(process.cwd(), 'reactpwa.config.json');
    const hasDefaultReactpwaConfig = existsSync(defaultConfigPath);
    if (!hasDefaultReactpwaConfig) {
      return false;
    }
    absolutePath = defaultConfigPath;
  }
  if (!isAbsolute(absolutePath)) {
    absolutePath = resolve(process.cwd(), reactpwaConfigFile);
  }
  if (existsSync(absolutePath)) {
    if (extname(absolutePath) !== '.json') {
      // eslint-disable-next-line no-console
      console.error('ERROR: Reactpwa config file should be a valid json file like reactpwa.config.json');
      process.exit(1);
    }
    return absolutePath;
  }
  return false;
};

const getReactpwaConfig = (): Record<string, any> => {
  const absolutePath = getReactpwaConfigFilePath();
  if (!absolutePath) {
    // eslint-disable-next-line no-console
    console.warn(`WARNING: Unable to resolve path ${absolutePath}`);
    return {};
  }
  try {
    const reactpwaConfigData = readFileSync(absolutePath, { encoding: 'utf-8' });
    return JSON.parse(reactpwaConfigData);
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
    // return nothing
  }
  return {};
};

program.command('dev')
  .description('Start the current project in development mode')
  .action(async () => {
    const { mode } = program.opts();
    const projectRoot = process.cwd();
    // Something to do here now.
    const reactpwaCore = await import ('@reactpwa/core/start');
    let server: Awaited<ReturnType<typeof reactpwaCore.run>>;
    let restartingServer = false;
    const stopServer = (cb: () => void = () => {}) => {
      server.close(cb);
    };
    const startServer = async () => {
      server = await reactpwaCore.run({
        projectRoot,
        envVars: getEnvVars(),
        config: getReactpwaConfig(),
        mode: mode ?? 'development',
      });
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
      getReactpwaConfigFilePath(),
      getEnvFilePath(),
      `${resolve(projectRoot, 'src', 'public')}`,
    ].filter((n) => (typeof n === 'string')) as string[];
    const watcher = chokidar.watch(watchPaths, { ignoreInitial: true });
    watcher.on('all', (_event, path) => {
      if (path.indexOf('/public/') !== -1) {
        // eslint-disable-next-line no-console
        console.info('Changes observed in public folder. Restarting Server.');
      } else {
        // eslint-disable-next-line no-console
        console.info('Changes observed in configurations (env/config). Restarting Server.');
      }
      restartServer();
    });
  });

program.command('build')
  .description('Build the current project')
  .action(async () => {
    const { mode } = program.opts();
    const projectRoot = process.cwd();
    // Something to do here now.
    const reactpwaCore = await import ('@reactpwa/core/build');
    reactpwaCore.run({
      projectRoot,
      envVars: getEnvVars(),
      config: getReactpwaConfig(),
      mode: mode ?? 'production',
    });
  });

program.parse();
