import { isAbsolute, resolve, extname } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { Command } from 'commander';
import { expand } from 'dotenv-expand';
import { parse } from 'dotenv';

/**
 * Return closure that works with program
 * @param program Command
 * @returns false | string
 */
export const getEnvFilePath = (program: Command) => (): false | string => {
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

/**
 * Return closure to get envVars for the project
 * @param program Command
 * @returns Record<string, string>
 */
export const getEnvVars = (program: Command) => (): Record<string, any> => {
  const { envConfigFile } = program.opts();
  const envFilePath = getEnvFilePath(program)();
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

/**
 * @param program Command
 * @returns false | string
 */
export const getReactpwaConfigFilePath = (program: Command) => (): string | false => {
  const { reactpwaConfigFile } = program.opts();

  let configPath = resolve(process.cwd(), 'reactpwa.config.json');
  const hasDefaultReactpwaConfig = existsSync(configPath);

  // if no path is specified and default does not exists, then
  // return false
  if (!reactpwaConfigFile && !hasDefaultReactpwaConfig) {
    return false;
  }

  if (reactpwaConfigFile) {
    configPath = reactpwaConfigFile;
  }

  if (!isAbsolute(configPath)) {
    configPath = resolve(process.cwd(), reactpwaConfigFile);
  }

  if (existsSync(configPath)) {
    if (extname(configPath) !== '.json') {
      // eslint-disable-next-line no-console
      console.error('ERROR: Reactpwa config file should be a valid json file like reactpwa.config.json');
      process.exit(1);
    }
    return configPath;
  }
  return false;
};

export const getReactpwaConfig = (program: Command) => (): Record<string, any> => {
  const absolutePath = getReactpwaConfigFilePath(program)();
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

type RunOptions = {
  serverSideRender: boolean;
};

export const getRunOptions = (program: Command, options: RunOptions, defaultMode = 'development') => {
  const { mode } = program.opts();
  const { cdnPath } = program.opts();
  const projectRoot = process.cwd();
  return {
    projectRoot,
    envVars: getEnvVars(program)(),
    config: { ...getReactpwaConfig(program)(), cdnPath },
    mode: mode ?? defaultMode,
    serverSideRender: options.serverSideRender,
  };
};
