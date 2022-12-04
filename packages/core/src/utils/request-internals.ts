import { FastifyRequest } from 'fastify';

const requestInternals = new WeakMap();

export const setInternalVar = (
  request: FastifyRequest,
  key: string,
  value: any,
) => {
  const requestVals = requestInternals.get(request) ?? {};
  requestInternals.set(request, {
    ...requestVals,
    [key]: value,
  });
};

export const getInternalVar = <T = any>(
  request: FastifyRequest,
  key: string,
  defaultValue?: T,
) => requestInternals.get(request)?.[key] ?? defaultValue ?? null;
