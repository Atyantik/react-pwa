import {
  ReactElement, memo, useContext, useEffect,
} from 'react';
import { findTitle } from '../utils/head/find-title.js';
import { ReactPWAContext } from './reactpwa.js';

export const Head = memo<{ children: ReactElement | ReactElement[] }>(
  ({ children }) => {
    const { setValue, getValue } = useContext(ReactPWAContext);

    if (typeof window === 'undefined') {
      const elements = getValue<ReactElement[]>('headElements', []);
      setValue('headElements', [
        ...elements,
        ...(Array.isArray(children) ? children : [children]),
      ]);
    }
    useEffect(() => {
      // Only reflect title changes
      const title = findTitle(children);
      if (typeof title === 'string') {
        document.title = title;
      }
    }, [children]);
    return null;
  },
);
