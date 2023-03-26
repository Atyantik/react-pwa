import { parse } from 'node:url';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import * as webpack from 'webpack';
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
  webpackStats:
  | webpack.Stats
  | webpack.MultiStats
  | webpack.StatsCompilation
  | undefined,
): ChunksMap => {
  let stats = webpackStats as any;
  if (webpackStats && 'toJson' in webpackStats) {
    stats = webpackStats?.toJson?.() ?? {};
  }
  if (!stats) {
    return {
      assetsByChunkName: {},
      chunks: [],
    };
  }

  // Extract from id and children
  // const chunks = (stats.chunks ?? []).map((asset: any) => ({
  //   id: asset?.id,
  //   idHints: asset?.idHints,
  //   names: asset?.names,
  //   files: asset?.files,
  //   children: asset?.children,
  // }));

  return {
    assetsByChunkName: {
      main: stats.assetsByChunkName.main,
    },
    chunks: [],
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

export const extractMainScripts = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter((file) => hasExtension(file, '.mjs'))
  .map(prependForwardSlash);

export const extractMainStyles = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter((file) => hasExtension(file, '.css'))
  .map(prependForwardSlash);
