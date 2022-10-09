/**
 * Check for env variable in current running
 * environment available, or use the default value otherwise
 * @param key
 * @param defaultValue
 */
export const getEnv = (key: string, defaultValue: any = '') => {
  if (typeof process === 'undefined') {
    return defaultValue;
  }
  const envVal = process?.env?.[key];
  if (!envVal) {
    return defaultValue;
  }
  return envVal;
};

const APP_URL = getEnv('APP_URL', process.env.APP_URL ?? '');

export const getAppUrl = (url: string = '') => {
  let windowUrl;
  if (typeof window !== 'undefined') {
    windowUrl = window.location.href;
  }

  if (!(url || windowUrl)) {
    return APP_URL;
  }
  const u = `${url || windowUrl || ''}/`;
  if (u.indexOf('http') === -1) {
    return APP_URL;
  }
  let appUrl;
  if (u.indexOf(APP_URL) !== -1) {
    appUrl = APP_URL;
  }

  if (!appUrl) {
    return APP_URL;
  }
  return appUrl;
};
