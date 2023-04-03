import { resolve } from 'node:path';
import webpackNodeExternals from 'webpack-node-externals';
import { libSrc } from '../root.js';

export const getNodeExternals = (options: {
  projectRoot: string;
  allowList: string[];
}): ReturnType<typeof webpackNodeExternals> => webpackNodeExternals({
  allowlist: [
    /@reactpwa/,
    /\.(css|s[ac]ss)$/i,
    ...options.allowList.map((al) => new RegExp(al)),
  ],
  additionalModuleDirs: [
    resolve(options.projectRoot, 'node_modules'),
    resolve(libSrc, 'node_modules'),
    resolve(libSrc, '..', 'node_modules'),
    resolve(libSrc, '..', '..', 'node_modules'),
    resolve(libSrc, '..', '..', '..', 'node_modules'),
  ],
});
