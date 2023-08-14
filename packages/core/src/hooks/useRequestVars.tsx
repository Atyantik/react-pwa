import { useContext } from 'react';
import { ReactPWAContext } from '../components/reactpwa.js';

export function useRequestVars() {
  const { getValue, setValue } = useContext(ReactPWAContext);

  return {
    getValue: (key: string, defaultValue: any = null) => {
      const appKey = `__app_${key}`;
      return getValue(appKey, defaultValue);
    },
    setValue: (key: string, value: any) => {
      const appKey = `__app_${key}`;
      setValue(appKey, value);
    },
  };
}
