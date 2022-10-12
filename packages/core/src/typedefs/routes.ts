import { parse } from 'bowser';

export type RoutesArgs = {
  getLocation: () => URL;
  browserDetect: Promise<() => ReturnType<typeof parse>>;
  userAgent: string;
  isbot: Promise<() => Boolean>;
};
