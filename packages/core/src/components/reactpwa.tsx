import { createContext } from 'react';

const initialContextValue = {
  setValue: (() => {}) as (key: string, value: any) => void,
  getValue: (() => null) as <T = any>(key: string, defaultValue: T) => T,
};

export const ReactPWAContext = createContext(initialContextValue);
