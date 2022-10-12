import { FastifyReply } from 'fastify';
import { CookieChangeOptions } from 'universal-cookie';

export const cookieChangeHandler = (reply: FastifyReply) => (change: CookieChangeOptions) => {
  if (reply.sent) return;
  if (change.value === undefined) {
    reply.clearCookie(change.name, change.options);
  } else {
    const cookieOpt = { ...change.options };
    if (cookieOpt.maxAge && change.options && change.options.maxAge) {
      // the standard for maxAge is seconds but npm cookie uses milliseconds
      cookieOpt.maxAge = change.options.maxAge * 1000;
    }

    try {
      reply.setCookie(change.name, change.value, cookieOpt);
      const setCookieHeader = reply.getHeader('set-cookie');
      if (reply.raw.headersSent) {
        // eslint-disable-next-line no-console
        console.warn(
          '\nWARNING : NO_EFFECT :: Cannot set cookie on SSR render as headers are already sent.\nCookie details:',
          change,
        );
      } else if (setCookieHeader) {
        reply.raw.setHeader('set-cookie', setCookieHeader);
      }
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }
};
