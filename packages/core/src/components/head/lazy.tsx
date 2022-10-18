import { useContext } from 'react';
import { DataContext } from '../data.js';
import { HeadContext } from './context.js';

export const LazyHead: React.FC = () => {
  const { awaitDataCompletion } = useContext(DataContext);
  awaitDataCompletion('@reactpwa/core.head').read();

  const { elements } = useContext(HeadContext);
  return <>{elements.current}</>;
};
