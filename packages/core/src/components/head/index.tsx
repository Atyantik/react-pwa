import {
  memo, useId, useContext, useEffect,
} from 'react';
import { HeadElement } from '../../typedefs/head.js';
import { HeadContext } from './context.js';

export const Head = memo<{ children: HeadElement; resolve?: boolean }>(
  ({ children, resolve }) => {
    const { addChildren, removeChildren, resolveDataPromiseResolver } = useContext(HeadContext);
    const id = useId();
    useEffect(() => {
      addChildren(children, id);
      return () => {
        removeChildren(id);
      };
    }, [children]);
    if (typeof window === 'undefined') {
      addChildren(children, id);
      if (resolve) {
        resolveDataPromiseResolver();
      }
    }
    return null;
  },
);
