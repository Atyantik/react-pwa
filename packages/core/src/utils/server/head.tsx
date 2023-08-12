import type { Request } from 'express';
import { renderToString } from 'react-dom/server';
import { initWebmanifest } from './webmanifest.js';
import { IWebManifest } from '../../typedefs/webmanifest.js';
import { getInternalVar } from '../request-internals.js';
import { convertToReactElement, sanitizeElements } from '../head/server.js';
import { extractScripts, extractStyles } from '../asset-extract.js';
import { memoize } from '../memoize.js';
import { getRequestUniqueId } from './request-id.js';
import { hash } from '../hash.js';

const getDefaultHeadTags = async (request: Request) => {
  await initWebmanifest(request);
  const {
    charSet: webCharSet,
    name,
    description,
  } = getInternalVar<IWebManifest>(request, 'Webmanifest', {});
  const charSet = webCharSet ?? 'UTF-8';
  const defaultElements = [
    <meta key="charset" charSet={charSet} />,
    <meta
      key="X-UA-Compatible"
      httpEquiv="X-UA-Compatible"
      content="IE=Edge"
    />,
    <meta
      key="viewport"
      name="viewport"
      content="width=device-width, initial-scale=1"
    />,
  ];
  if (name) {
    defaultElements.push(<title key="title">{name}</title>);
  }
  if (description) {
    defaultElements.push(
      <meta key="description" name="description" content={description} />,
    );
  }
  return defaultElements;
};

const getStyles = async (
  lazyModules: string[],
  lazyWebpack: (string | number)[],
  chunksMap: any,
) => {
  const styles = extractStyles(lazyModules, lazyWebpack, chunksMap);
  return styles
    .map(
      (style) => `<link data-href="${style}" rel="stylesheet" href="${style}" />`,
    )
    .join('');
};

const getScripts = async (
  lazyModules: string[],
  lazyWebpack: (string | number)[],
  chunksMap: any,
) => {
  const scripts = extractScripts(lazyModules, lazyWebpack, chunksMap);
  return (
    '<script>var _orp,_pr=0;window.preloadComplete=!1,_orp=(()=>{var o,l;'
    + `(_pr+=1)===${scripts.length}&&(window.preloadComplete=!0,`
    + `null===(o=(l=window).onPreloadComplete)||void 0===o||o.call(l))});</script>${scripts
      .map(
        (script) => `<link href="${script}" data-script-type="route" `
          + `onload="_orp()" rel="preload" href="${script}" `
          + 'as="script" />',
      )
      .join('')}`
  );
};

const memoizedGetStyles = memoize(getStyles, (a, b) => hash(JSON.stringify([a, b])));
const memoizedGetScripts = memoize(getScripts, (a, b) => hash(JSON.stringify([a, b])));

const headContent = async (request: Request) => {
  const { chunksMap } = request.app.locals;
  await initWebmanifest(request);
  const { lang: webLang } = getInternalVar<IWebManifest>(
    request,
    'Webmanifest',
    {},
  );
  const lang = webLang ?? 'en';
  const defaultHeadTags = await getDefaultHeadTags(request);
  const collectedHeadTags = getInternalVar(request, 'headElements', []);

  /**
   * We remove duplicate tags, sort by priority and parse fragments
   */
  const elements = sanitizeElements([
    ...defaultHeadTags,
    ...convertToReactElement(collectedHeadTags),
  ]);
  const headStr = renderToString(<>{elements}</>);

  const lazyModules = Array.from(
    getInternalVar(request, 'lazyModules', new Set()) as Set<string>,
  );
  const lazyWebpack = Array.from(
    getInternalVar(request, 'lazyWebpack', new Set()) as Set<string | number>,
  );

  const scripts = await memoizedGetScripts(lazyModules, lazyWebpack, chunksMap);

  const htmlSnippets = [
    '<!DOCTYPE html>',
    `<html lang="${lang}">`,
    '<head>',
    headStr,
    await memoizedGetStyles(lazyModules, lazyWebpack, chunksMap),
    scripts,
    '</head>',
  ];
  return htmlSnippets.join('');
};

/**
 * Whenever memoizing a function with request as parameter, we need to make sure
 * that we pass the other function to create a unique key for memoization
 */
export const getHeadContent = memoize(headContent, (r) => getRequestUniqueId(r));
