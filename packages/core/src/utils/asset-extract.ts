import { parse } from 'node:url';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { Stats, MultiStats } from 'webpack';
import { RouteMatch, RouteObject } from 'react-router-dom';

export type LazyRouteMatch = RouteMatch & {
  route: RouteObject & {
    webpack?: (string | number)[];
    module?: string[];
  };
};
export type ChunksMap = {
  assetsByChunkName?: Record<string, string[]>;
  chunks: {
    // position: number;
    names?: string[];
    id?: string | number;
    files?: string[];
    parents?: (string | number)[];
    children?: (string | number)[];
    reasons?: string[];
    reasonsStr?: string;
    reasonModules?: (string | number)[];
  }[];
};

export const extractChunksMap = (
  webpackStats: Stats | MultiStats | undefined,
): ChunksMap => {
  const stats = webpackStats?.toJson?.() ?? {};

  // Extract from id and children
  const chunks = (stats.chunks ?? []).map((asset) => ({
    id: asset?.id,
    idHints: asset?.idHints,
    names: asset?.names,
    files: asset?.files,
    children: asset?.children,
  }));

  return {
    assetsByChunkName: stats.assetsByChunkName ?? {},
    chunks,
  };
};

const hasExtension = (url: string, ext: string) => {
  try {
    const parsed = parse(url);
    return parsed.pathname?.endsWith?.(ext);
  } catch {
    // Do nothing
  }
  return false;
};

const prependForwardSlash = (file: string) => {
  if (file.startsWith('http')) {
    return file;
  }
  return file.startsWith('/') ? file : `/${file}`;
};

export const getCssFileContent = async (cssFile: string) => {
  const cssFileResolve = join(__dirname, 'build', cssFile);
  let cssContent = '';
  if (existsSync(cssFileResolve)) {
    cssContent = readFileSync(cssFileResolve, { encoding: 'utf-8' });
  } else {
    throw new Error('CSS file not found!');
  }
  return cssContent;
};

export const extractMainScript = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter((file) => hasExtension(file, '.js'))
  .map(prependForwardSlash)?.[0];

export const extractMainStyle = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter((file) => hasExtension(file, '.css'))
  .map(prependForwardSlash)?.[0];
