import { parse } from 'node:url';
import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { Stats, MultiStats } from 'webpack';
import { RouteMatch, RouteObject } from 'react-router-dom';

export type LazyRouteMatch = RouteMatch & {
  route: RouteObject & {
    webpack?: string | number;
    module?: string;
  };
};
export type ChunksMap = {
  assetsByChunkName?: Record<string, string[]>;
  chunks: {
    // position: number;
    id?: string | number;
    files?: string[];
    parents?: (string | number)[];
    children?: (string | number)[];
    reasons?: string[];
    reasonsStr?: string;
  }[];
};

type PositionedFiles = {
  // position: number;
  files: string[];
};

export const extractChunksMap = (
  webpackStats: Stats | MultiStats | undefined,
): ChunksMap => {
  const stats = webpackStats?.toJson?.() ?? {};

  // Extract from reasons, id, parents and children
  const chunks = (stats.chunks ?? []).map((asset) => {
    const reasons: string[] = [
      ...new Set(
        (asset?.modules ?? [])
          .map((mod) => (mod?.reasons ?? []).map((reason) => reason?.userRequest))
          .flat()
          .filter(Boolean),
      ),
    ].filter((r) => typeof r === 'string') as string[];
    return {
      id: asset?.id,
      // position: index + 1,
      name: asset?.name,
      files: asset?.files,
      parents: asset?.parents,
      children: asset?.children,
      reasons,
      reasonsStr: reasons.join('||'),
    };
  });
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

const filesFromChunks = (chunks: ChunksMap['chunks'], ext: string) => {
  const files: string[] = [];
  chunks.forEach((chunk) => {
    (chunk.files ?? []).forEach((file) => {
      if (hasExtension(file, ext)) {
        files.push(file);
      }
    });
  });
  return files;
};

const addById = (
  webpackId: string | number,
  chunksMap: ChunksMap,
  positionedFiles: PositionedFiles[],
  ext: string,
  extractedAssets: Set<string | number>,
) => {
  if (extractedAssets.has(webpackId)) {
    return;
  }
  extractedAssets.add(webpackId);
  const idChunk = chunksMap.chunks.find((chunk) => chunk.id === webpackId);
  if (idChunk) {
    positionedFiles.push({
      // position: idChunk.position,
      files: filesFromChunks([idChunk], ext),
    });

    // Check children
    (idChunk.children ?? []).forEach((childId) => {
      if (childId !== webpackId) {
        addById(childId, chunksMap, positionedFiles, ext, extractedAssets);
      }
    });
  }
};

const prependForwardSlash = (file: string) => {
  if (file.startsWith('http')) {
    return file;
  }
  return file.startsWith('/') ? file : `/${file}`;
};

export const extractFiles = (
  matchedRoutes: LazyRouteMatch[],
  chunksMap: ChunksMap,
  ext: string,
) => {
  if (!matchedRoutes) {
    return [];
  }
  // First get the main assets via assetByChunksName
  const positionedFiles: {
    // position: number;
    files: string[];
  }[] = [];

  // Concat files from main chunk
  const filesFromMain = (chunksMap.assetsByChunkName?.main ?? []).filter(
    (file) => hasExtension(file, ext),
  );

  if (filesFromMain.length) {
    positionedFiles.push({
      // position: -999,
      files: (chunksMap.assetsByChunkName?.main ?? []).filter((file) => hasExtension(file, ext)),
    });
  }

  // Once done, find the main files from @currentProject
  const currentProjectChunks = chunksMap.chunks.filter(
    (chunk) => chunk?.reasonsStr?.indexOf?.('@currentProject') !== -1
      || chunk?.reasonsStr?.indexOf?.('@reactpwa') !== -1,
  );
  const filesFromCurrentProjectChunks = filesFromChunks(
    currentProjectChunks,
    ext,
  );
  if (filesFromCurrentProjectChunks.length) {
    positionedFiles.push({
      // position: -998,
      files: filesFromChunks(currentProjectChunks, ext),
    });
  }

  const extractedAssets = new Set<string | number>();

  // Once done with main and @currentProject
  // Loop through routes
  matchedRoutes.forEach((matchedRoute) => {
    // check for modules first and in order
    // as it might be a direct reason
    if (matchedRoute?.route?.module) {
      chunksMap.chunks
        .filter(
          (chunk) => chunk?.reasonsStr?.indexOf?.(`||${matchedRoute.route.module}||`)
            !== -1,
        )
        .forEach((chunk) => {
          positionedFiles.push({
            // position: chunk.position,
            files: filesFromChunks([chunk], ext),
          });
        });
    }

    if (typeof matchedRoute?.route?.webpack !== 'undefined') {
      let webpackId = matchedRoute.route.webpack;
      if (typeof matchedRoute.route.webpack === 'string') {
        webpackId = matchedRoute.route.webpack
          .replace(/[./]/gi, '_')
          .replace(/^_+|_+$/g, '');
      }

      // Add chunk with ID and add its children as well.
      addById(webpackId, chunksMap, positionedFiles, ext, extractedAssets);
    }
  });
  // positionedFiles.sort((a, b) => a.position - b.position);
  return [...new Set(positionedFiles.map((p) => p.files).flat())].map(
    prependForwardSlash,
  );
};

const cssContentMap = new Map();

const getCssFileContent = async (cssFile: string) => {
  const cssFileResolve = join(__dirname, 'build', cssFile);
  let cssContent = '';
  if (existsSync(cssFileResolve)) {
    cssContent = readFileSync(cssFileResolve, { encoding: 'utf-8' });
  } else {
    throw new Error('CSS file not found!');
  }
  return cssContent;
};

export const extractStyles = (
  matchedRoutes: LazyRouteMatch[],
  chunksMap: ChunksMap,
) => extractFiles(matchedRoutes, chunksMap, '.css');

export const extractStylesWithContent = async (
  matchedRoutes: LazyRouteMatch[],
  chunksMap: ChunksMap,
) => {
  const cssFiles = extractStyles(matchedRoutes, chunksMap);
  const cssContentFiles: { href: string, content: string }[] = await Promise.all(cssFiles.map(async (cssFile) => {
    if (cssContentMap.has(cssFile)) {
      return {
        href: cssFile,
        content: cssContentMap.get(cssFile),
      };
    }
    const cssContent = await getCssFileContent(cssFile);
    cssContentMap.set(cssFile, cssContent);
    return {
      href: cssFile,
      content: cssContent,
    };
  }));
  return cssContentFiles;
};

export const extractScripts = (
  matchedRoutes: LazyRouteMatch[],
  chunksMap: ChunksMap,
) => extractFiles(matchedRoutes, chunksMap, '.js');

export const extractMainScript = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter((file) => hasExtension(file, '.js'))
  .map(prependForwardSlash);
