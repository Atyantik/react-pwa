import { Request } from 'express';

const requestInternals = new WeakMap();

export const setInternalVar = (request: Request, key: string, value: any) => {
  const requestVals = requestInternals.get(request) ?? {};
  requestInternals.set(request, {
    ...requestVals,
    [key]: value,
  });
};

export const getInternalVar = <T = any>(
  request: Request,
  key: string,
  defaultValue?: T,
) => requestInternals.get(request)?.[key] ?? defaultValue ?? null;
