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

const getStats = (webpackStats: any) => {
  if (webpackStats && 'toJson' in webpackStats) {
    return webpackStats?.toJson?.() ?? {};
  }
  return webpackStats;
};

const getPublicPathUrl = (publicPath: string) => {
  let isExternalCdn = false;
  let publicPathUrl = new URL('https://www.reactpwa.com');
  try {
    publicPathUrl = new URL(publicPath);
    isExternalCdn = true;
  } catch (ex) {
    console.log('invalid public path url');
  }
  return { publicPathUrl, isExternalCdn };
};

const processMainAssets = (
  mainAssets: string[] = [],
  isExternalCdn: boolean = false,
  publicPathUrl: URL = new URL('https://www.reactpwa.com'),
) => mainAssets.map((asset: string) => {
  if (isExternalCdn) {
    return new URL(asset, publicPathUrl).toString();
  }
  return asset;
});

export const extractChunksMap = (
  webpackStats:
  | webpack.Stats
  | webpack.MultiStats
  | webpack.StatsCompilation
  | undefined,
): ChunksMap => {
  const stats = getStats(webpackStats);
  if (!stats) {
    return {
      assetsByChunkName: {},
      chunks: [],
    };
  }

  const { publicPathUrl, isExternalCdn } = getPublicPathUrl(stats.publicPath);
  // Extract from id and children
  // const chunks = (stats.chunks ?? []).map((asset: any) => ({
  //   id: asset?.id,
  //   idHints: asset?.idHints,
  //   names: asset?.names,
  //   files: asset?.files,
  //   children: asset?.children,
  // }));
  const main = processMainAssets(
    stats.assetsByChunkName?.main,
    isExternalCdn,
    publicPathUrl,
  );

  return {
    assetsByChunkName: {
      main,
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
  .filter(
    (file) => hasExtension(file, '.mjs') && file.indexOf('hot-update') === -1,
  )
  .map(prependForwardSlash);

export const extractMainStyles = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter((file) => hasExtension(file, '.css'))
  .map(prependForwardSlash);
