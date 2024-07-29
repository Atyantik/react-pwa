import { parse } from 'node:url';
import { RouteMatch, RouteObject } from 'react-router-dom';
import { Stats, MultiStats } from 'webpack';

export type LazyRouteMatch = RouteMatch & {
  route: RouteObject & {
    webpack?: (string | number)[];
    module?: string[];
  };
};
export type ChunksMap = {
  publicPath?: string;
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

  // Extract from reasons, id, parents and children
  const chunks = (stats.chunks ?? []).map((asset) => {
    /**
     * Collect reason for chunks
     */
    const reasons: string[] = [
      ...new Set(
        (asset?.modules ?? [])
          .map((mod) => (mod?.reasons ?? []).map((reason) => reason?.userRequest))
          .flat()
          .filter(Boolean),
      ),
    ].filter((r) => typeof r === 'string') as string[];

    /**
     * Collect reason modules for the chunk
     */
    const reasonModules = [
      ...new Set(
        (asset?.modules ?? [])
          .map((mod) => (mod?.reasons ?? []).map((reason) => reason?.moduleId))
          .flat()
          .filter(Boolean),
      ),
    ] as (string | number)[];

    return {
      ...asset,
      id: asset?.id,
      // position: index + 1,
      names: asset?.names,
      files: asset?.files,
      parents: asset?.parents,
      children: asset?.children,
      reasons,
      reasonModules,
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

// const addById = (
//   webpackId: string | number,
//   chunksMap: ChunksMap,
//   files: Set<string>,
//   ext: string,
//   extractedAssets: Set<string | number>,
// ) => {
//   if (extractedAssets.has(webpackId)) {
//     return;
//   }
//   extractedAssets.add(webpackId);
//   const idChunk = chunksMap.chunks.find((chunk) => chunk.id === webpackId);
//   if (idChunk) {
//     filesFromChunks([idChunk], ext).forEach((file) => {
//       files.add(file);
//     });

//     // Check children
//     (idChunk.children ?? []).forEach((childId) => {
//       if (childId !== webpackId) {
//         addById(childId, chunksMap, files, ext, extractedAssets);
//       }
//     });
//   }
// };

const prependForwardSlash = (file: string) => {
  if (file.startsWith('http')) {
    return file;
  }
  return file.startsWith('/') ? file : `/${file}`;
};

export const extractFiles = (
  modules: string[],
  webpack: (string | number)[],
  chunksMap: ChunksMap,
  ext: string,
) => {
  if (!modules.length && !webpack.length) {
    return [];
  }

  // First get list of files from main chunk
  const files = new Set(
    (chunksMap.assetsByChunkName?.main ?? []).filter((file) => hasExtension(file, ext)),
  );

  // Once done, find the main files from @currentProject
  const currentProjectChunks = chunksMap.chunks.filter(
    // All files dependent on current project
    (chunk) => chunk?.reasonsStr?.indexOf?.('@currentProject') !== -1
      // All files dependent on @reactpwa
      || chunk?.reasonsStr?.indexOf?.('@reactpwa') !== -1
      // All files that are not dependent on anyone, i.e. the core files.
      || chunk?.reasonsStr === '',
  );

  const filesFromCurrentProjectChunks = filesFromChunks(
    currentProjectChunks,
    ext,
  );
  if (filesFromCurrentProjectChunks.length) {
    filesFromChunks(currentProjectChunks, ext).forEach((file) => {
      files.add(file);
    });
  }

  const chunksSet = new Set<number>();

  const addReasonChunk = (chunkId: string | number) => {
    chunksMap.chunks.forEach((chunk) => {
      if (
        chunk.id
        && typeof chunk.id === 'number'
        && chunk?.reasonModules?.includes?.(chunkId)
        && !chunksSet.has(chunk.id)
      ) {
        chunksSet.add(chunk.id);
        addReasonChunk(chunk.id);
      }
    });
  };

  modules?.forEach((moduleId) => {
    chunksMap.chunks
      .filter(
        (chunk) => chunk?.reasonsStr?.indexOf?.(`||${moduleId}||`) !== -1
          || chunk?.reasonsStr === moduleId,
      )
      .forEach((chunk) => {
        if (chunk.id && typeof chunk.id === 'number') {
          chunksSet.add(chunk.id);
          addReasonChunk(chunk.id);
        }
      });
  });

  webpack?.forEach((wId) => {
    const webpackId = wId;
    if (webpackId && typeof webpackId === 'number') {
      chunksMap.chunks
        .filter(
          // @ts-ignore
          (chunk) => chunk?.reasonModules?.indexOf?.(webpackId) !== -1,
        )
        .forEach((chunk) => {
          if (chunk.id && typeof chunk.id === 'number') {
            chunksSet.add(chunk.id);
            addReasonChunk(chunk.id);
          }
        });
    }
  });

  const chunks = chunksMap.chunks.filter((c) => {
    if (c.id && typeof c.id === 'number') {
      return chunksSet.has(c.id);
    }
    return false;
  });

  filesFromChunks(chunks, ext).forEach((file) => {
    files.add(file);
  });

  return [...files].map(prependForwardSlash);
};

export const extractStyles = (
  modules: string[],
  webpack: (string | number)[],
  chunksMap: ChunksMap,
) => extractFiles(modules, webpack, chunksMap, '.css');

/**
 * extractScripts should return all the scripts that needs to be prefetched
 * for appropriate performance.
 * @param matchedRoutes LazyRouteMatch[]
 * @param chunksMap ChunksMap
 * @returns string[]
 */
export const extractScripts = (
  modules: string[],
  webpack: (string | number)[],
  chunksMap: ChunksMap,
) => extractFiles(modules, webpack, chunksMap, '.js');

export const extractMainScripts = (chunksMap: ChunksMap) => (chunksMap?.assetsByChunkName?.main ?? [])
  .filter(
    (file) => hasExtension(file, '.js') && file.indexOf('hot-update') === -1,
  )
  .map(prependForwardSlash);
