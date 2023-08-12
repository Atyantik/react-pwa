import type { Request, Response } from 'express';
// @ts-ignore
import appWebmanifest from '@currentProject/webmanifest';
import { getInternalVar, setInternalVar } from '../request-internals.js';
import { WebManifest } from '../../index.js';
import { getRequestArgs } from '../server.js';

export const initWebmanifest = async (request: Request) => {
  const computedWebmanifest = getInternalVar(request, 'Webmanifest', null);
  if (computedWebmanifest !== null) {
    return;
  }
  if (typeof appWebmanifest === 'function') {
    const webmanifest: WebManifest = await appWebmanifest(
      getRequestArgs(request),
    );
    setInternalVar(request, 'Webmanifest', webmanifest);
    return;
  }
  setInternalVar(request, 'Webmanifest', appWebmanifest ?? {});
};

export const webmanifestHandler = async (
  request: Request,
  response: Response,
) => {
  await initWebmanifest(request);
  response.json(getInternalVar(request, 'Webmanifest', {}));
};
