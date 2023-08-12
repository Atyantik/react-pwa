import type { Request } from 'express';

const requestInternals = new WeakMap();

export const setInternalVar = (
  reference: Request | object | Symbol,
  key: string,
  value: any,
) => {
  const requestVals = requestInternals.get(reference) ?? {};
  requestInternals.set(reference, {
    ...requestVals,
    [key]: value,
  });
};

export const getInternalVar = <T = any>(
  reference: Request | object | Symbol,
  key: string,
  defaultValue?: T,
) => requestInternals.get(reference)?.[key] ?? defaultValue ?? null;
