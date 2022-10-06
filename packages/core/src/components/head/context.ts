import { createContext } from 'react';
import { HeadElement } from '../../typedefs/head';

const initialContextValue = {
  addChildren: (() => {}) as ((children: HeadElement, id: string) => void),
  removeChildren: (() => {}) as ((id: string) => void),
  elements: { current: [] } as React.MutableRefObject<React.ReactElement[]>,
};

export const HeadContext = createContext<typeof initialContextValue>(
  initialContextValue,
);
