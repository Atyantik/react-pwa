import { useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../components/data.js';

export function useData<T extends (
) => Promise<any>>(
  id: string,
  promiseCallback: T,
) {
  const { createDataPromise, removeDataPromise } = useContext(DataContext);
  // On unmount remove the data promise
  useEffect(() => () => removeDataPromise(id), []);
  return useMemo(() => {
    const promise = createDataPromise(id, promiseCallback);
    return promise.read();
  }, [id, promiseCallback]);
}
