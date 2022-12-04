import { existsSync } from 'node:fs';

const javascriptExtensions = [
  '.mjs',
  '.mjsx',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
];

export const projectExistsSync = (
  filePath: string,
  extension = javascriptExtensions,
) => {
  if (existsSync(filePath)) return filePath;
  let resolvedFilePath = '';
  extension.forEach((jsExt) => {
    if (resolvedFilePath) {
      return;
    }
    if (existsSync(filePath + jsExt)) {
      resolvedFilePath = filePath + jsExt;
    }
  });
  return resolvedFilePath;
};
