import { useContext } from 'react';
import { ReactPWAContext } from '../components/reactpwa.js';
import { wrapPromise } from '../utils/promise.js';

export function useData<T extends (
) => Promise<any>>(
  id: string,
  promiseCallback: T,
): Awaited<ReturnType<T>> {
  const { getValue, setValue } = useContext(ReactPWAContext);
  const syncData = getValue('syncData', new Map());

  if (syncData.has(id)) {
    return syncData.get(id);
  }

  let promisesMap = getValue<
  false | Map<string, ReturnType<typeof wrapPromise>>
  >('dataPromisesMap', false);
  if (!promisesMap) {
    promisesMap = new Map<string, ReturnType<typeof wrapPromise>>();
    setValue('dataPromisesMap', promisesMap);
  }

  let promise: ReturnType<typeof wrapPromise> | undefined;

  // If the promise was already initated, then return the promise
  // do not re-initiate the promise
  if (promisesMap.has(id)) {
    promise = promisesMap.get(id);
    const data = promise?.read?.();
    if (data) {
      return data;
    }
  }
  promise = wrapPromise(promiseCallback, {
    onFinalize: (status, data) => {
      if (status !== 'error' && typeof window === 'undefined') {
        console.log('Set Sync Data', id, data);
        syncData.set(id, data);
        setValue('syncData', syncData);
      }
    },
  });
  promisesMap.set(id, promise);
  const data = promise.read();
  // Once we have the data and if the data is called from server side,
  // add it to the list so that data can be synced later for hydration
  return data;
}
