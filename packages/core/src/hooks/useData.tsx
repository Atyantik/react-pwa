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
    return promise?.read?.();
  }
  promise = wrapPromise(promiseCallback);
  promisesMap.set(id, promise);
  const data = promise.read();
  // Once we have the data and if the data is called from server side,
  // add it to the list so that data can be synced later for hydration
  if (typeof window === 'undefined') {
    // Need to create the above, maybe from the data context
    // addToSyncList(id, data);
    syncData.set(id, data);
    setValue('syncData', syncData);
  }
  return data;
}
