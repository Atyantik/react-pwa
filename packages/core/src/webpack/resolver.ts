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
  const libraryHasNodeModules = libraryNodeModules ? fs.existsSync(libraryNodeModules) : false;

  const workspaceNodeModules = resolve(libSrc, '..', '..', '..', 'node_modules');
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

export const getResolve = (
  options: {
    projectRoot: string,
  },
): Configuration['resolve'] => ({
  alias: {
    '@currentProject/webmanifest': (
      projectExistsSync(resolve(options.projectRoot, 'src', 'webmanifest'))
      || resolve(libSrc, 'defaults', 'webmanifest')
    ),
    '@currentProject': resolve(options.projectRoot, 'src'),
  },
  extensions: getResolveExtensions(),
});
