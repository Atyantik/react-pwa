import { Configuration } from 'webpack';
import { resolve } from 'node:path';
import fs from 'node:fs';
import { projectExistsSync } from '../utils/resolver.js';
import { libSrc } from '../root.js';

export const getResolveExtensions = (): string[] => [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
];

export const getResolveLoader = (): Configuration['resolveLoader'] => {
  const libraryNodeModules = resolve(libSrc, 'node_modules');
  const libraryHasNodeModules = libraryNodeModules
    ? fs.existsSync(libraryNodeModules)
    : false;

  const workspaceNodeModules = resolve(
    libSrc,
    '..',
    '..',
    '..',
    'node_modules',
  );
  const workspaceHasNodeModules = workspaceNodeModules
    ? fs.existsSync(workspaceNodeModules)
    : false;
  return {
    modules: [
      'node_modules',
      ...(libraryHasNodeModules ? [libraryNodeModules] : []),
      ...(workspaceHasNodeModules ? [workspaceNodeModules] : []),
    ],
  };
};

export const getResolve = (options: {
  projectRoot: string;
  alias?: Record<string, string>;
}): Configuration['resolve'] => {
  const resolveConfig: Configuration['resolve'] = {
    alias: {
      '@currentProject/webmanifest':
        projectExistsSync(resolve(options.projectRoot, 'src', 'webmanifest'))
        || resolve(libSrc, 'defaults', 'webmanifest'),
      '@currentProject/server':
        projectExistsSync(resolve(options.projectRoot, 'src', 'server'))
        || resolve(libSrc, 'defaults', 'server'),
      '@currentProject': resolve(options.projectRoot, 'src'),
    },
    extensions: getResolveExtensions(),
  };

  const aliasKeys = Object.keys(options.alias ?? {});
  if (options.alias && aliasKeys.length) {
    //
    for (let i = 0; i < aliasKeys.length; i += 1) {
      const key: string = aliasKeys[i];
      const path = resolve(options.projectRoot, options.alias[key]);
      if (!resolveConfig.alias) {
        resolveConfig.alias = {};
      }
      if (path) {
        // @ts-ignore
        resolveConfig.alias[key] = path;
      }
    }
  }
  return resolveConfig;
};
