import { useContext, useEffect, useMemo } from 'react';
import { DataContext } from '../components/data.js';
import { SyncDataScript } from '../components/sync-data-script.js';

export function useSyncData<T extends (
) => Promise<any>>(
  id: string,
  promiseCallback: T,
): { data: Awaited<ReturnType<T>>; syncScript: React.ReactElement } {
  const { createDataPromise, removeDataPromise } = useContext(DataContext);
  // On unmount remove the data promise
  useEffect(() => () => removeDataPromise(id), []);
  return useMemo(() => {
    const promise = createDataPromise(id, promiseCallback);
    const data = promise.read();
    return {
      data,
      syncScript: <SyncDataScript id={id} data={data} />,
    };
  }, [id, promiseCallback]);
}
