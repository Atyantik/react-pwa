import { RoutesArgs } from '../index.js';

const scopedCache = new WeakMap();

const setScopedVar = (key: string, value: any) => {
  const scopedVals = scopedCache.get(window) ?? {};
  scopedCache.set(window, {
    ...scopedVals,
    [key]: value,
  });
};

const hasScopedVar = (key: string) => !!(scopedCache.get(window)?.[key] ?? false);

const getScopedVar = <T extends any>(key: string, defaultValue?: T) => {
  const scopedValue = scopedCache.get(window)?.[key];
  return scopedValue ?? defaultValue ?? null;
};

const getScoped = async (
  key: string,
  cb: (() => any) | (() => Promise<any>),
) => {
  if (hasScopedVar(key)) {
    return getScopedVar(key);
  }
  const computedScopeCB = await cb();
  setScopedVar(key, computedScopeCB);
  return computedScopeCB;
};

const { userAgent } = window.navigator;
export const requestArgs: RoutesArgs = {
  getLocation: () => new URL(window.location.href),
  browserDetect: async () => {
    const { parse } = await import('bowser');
    try {
      return parse(userAgent);
    } catch {
      // Cannot parse useragent
    }
    return {
      browser: { name: '', version: '' },
      os: { name: '', version: '', versionName: '' },
      platform: { type: '' },
      engine: { name: '', version: '' },
    };
  },
  userAgent,
  isbot: async () => {
    const { default: isBot } = await import('isbot');
    isBot.exclude(['chrome-lighthouse']);
    return isBot(userAgent);
  },
  getScoped,
  addToHeadPreStyles: () => {
    // when called on client side do nothing
  },
  addToFooter: () => {
    // when called on client side do nothing
  },
  addHeaders: () => {
    // When called on client side do nothing
  },
};
