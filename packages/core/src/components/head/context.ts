import { createContext } from 'react';
import { HeadElement, PromiseResolver } from '../../typedefs/head';

type SetDataPromiseResolver = (options: { current: PromiseResolver }) => void;
const initialContextValue = {
  addChildren: (() => {}) as (children: HeadElement, id: string) => void,
  removeChildren: (() => {}) as (id: string) => void,
  elements: { current: [] } as React.MutableRefObject<React.ReactElement[]>,
  setDataPromiseResolver: (() => {}) as SetDataPromiseResolver,
  resolveDataPromiseResolver: (() => {}) as PromiseResolver,
};

export const HeadContext = createContext<typeof initialContextValue>(initialContextValue);
