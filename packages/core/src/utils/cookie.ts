import { Response } from 'express';
import { CookieChangeOptions } from 'universal-cookie';

export const cookieChangeHandler = (response: Response) => (change: CookieChangeOptions) => {
  if (response.headersSent) return;
  if (change.value === undefined) {
    response.clearCookie(change.name, change.options);
  } else {
    const cookieOpt = { ...change.options };
    if (cookieOpt.maxAge && change.options && change.options.maxAge) {
      // the standard for maxAge is seconds but npm cookie uses milliseconds
      cookieOpt.maxAge = change.options.maxAge * 1000;
    }
    try {
      response.cookie(change.name, change.value, cookieOpt);
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }
};
