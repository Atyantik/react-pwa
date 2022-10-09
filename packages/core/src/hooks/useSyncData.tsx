import { useContext, useMemo } from 'react';
import { DataContext } from '../components/data.js';
import { SyncDataScript } from '../components/sync-data-script.js';

export function useSyncData<T extends (
) => Promise<any>>(
  id: string,
  promiseCallback: T,
): { data: Awaited<ReturnType<T>>; syncScript: React.ReactElement } {
  const { createDataPromise } = useContext(DataContext);
  return useMemo(() => {
    const data = createDataPromise(id, promiseCallback);
    return {
      data,
      syncScript: <SyncDataScript id={id} data={data} />,
    };
  }, [id, promiseCallback]);
}
