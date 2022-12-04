import path from 'node:path';
import { readFileSync } from 'node:fs';
import WorkboxPlugin from 'workbox-webpack-plugin';
import { projectExistsSync } from '../utils/resolver.js';
import { InjectSW } from './plugins/inject-sw.js';

/**
 * @param projectSW Absolute path to service worker
 * @returns webpack.Plugin InjectSW | InjectManifest
 */
const injectSWManifest = (projectSW: string) => {
  const projectSWContent = readFileSync(projectSW, { encoding: 'utf-8' });
  // If no manifest is needed, then simply inject the project sw.js
  if (projectSWContent.indexOf('self.__WB_MANIFEST') === -1) {
    return new InjectSW({
      srcFile: projectSW,
    });
  }
  // If __WB_MANIFEST exists then inject it via the InjectManifest Plugin
  return new WorkboxPlugin.InjectManifest({
    swSrc: projectSW,
    swDest: 'sw.js',
  });
};

/**
 *
 * @param projectRoot string
 * @param serviceWorkerType boolean | 'minimal' | 'default'
 * @returns InjectSW | WorkboxPlugin.GenerateSW | InjectManifest
 */
export const getServiceWorker = (
  projectRoot: string,
  serviceWorkerType: boolean | 'minimal' | 'default',
) => {
  // Check if custom sw already exists
  const projectSW = projectExistsSync(path.join(projectRoot, 'src', 'sw.js'));

  // if Project service worker exists, then
  // return and inject accordingly
  if (projectSW) {
    return injectSWManifest(projectSW);
  }

  // If the minimal option is selected, simply inject the minimum
  // service worker for PWA
  if (serviceWorkerType === 'minimal') {
    return new InjectSW();
  }

  // If default option is selected then inject the offline supported
  // service worker
  return new WorkboxPlugin.GenerateSW({
    clientsClaim: true,
    skipWaiting: true,
    swDest: 'sw.js',
  });
};
