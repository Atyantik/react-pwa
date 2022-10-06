import {
  memo, useId, useContext, useEffect,
} from 'react';
import { HeadElement } from '../../typedefs/head.js';
import { HeadContext } from './context.js';

export const Head = memo<{ children: HeadElement }>(({ children }) => {
  const { addChildren, removeChildren } = useContext(HeadContext);
  const id = useId();
  useEffect(() => {
    addChildren(children, id);
    return () => {
      removeChildren(id);
    };
  }, [children]);
  if (typeof window === 'undefined') {
    addChildren(children, id);
  }
  return null;
});
