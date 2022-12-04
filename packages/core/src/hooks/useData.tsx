import { useContext, useMemo } from 'react';
import { DataContext } from '../components/data.js';

export function useData<T extends (
) => Promise<any>>(
  id: string,
  promiseCallback: T,
) {
  const { createDataPromise } = useContext(DataContext);
  return useMemo(() => {
    const promise = createDataPromise(id, promiseCallback);
    return promise.read();
  }, [id, promiseCallback]);
}
