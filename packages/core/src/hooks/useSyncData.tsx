import { useContext } from 'react';
import { ReactPWAContext } from '../components/reactpwa.js';

export function useSyncData() {
  const { getValue, setValue } = useContext(ReactPWAContext);
  const syncData = getValue('syncData', new Map());

  const setSyncData = (id: string, data: any) => {
    syncData.set(id, data);
    setValue('syncData', syncData);
  };

  const getSyncData = (id: string) => syncData.get(id);

  const hasSyncData = (id: string) => syncData.has(id);

  const removeSyncData = (id: string) => {
    syncData.delete(id);
    setValue('syncData', syncData);
  };

  return {
    setSyncData,
    getSyncData,
    hasSyncData,
    removeSyncData,
  };
}
