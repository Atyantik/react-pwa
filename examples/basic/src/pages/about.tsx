import { FC } from 'react';
import { Skeleton } from '@components/skeleton';
import { lazy } from '@reactpwa/core';

const LazyParent = lazy({
  element: () => import('@components/parent'),
  skeleton: Skeleton,
  error: () => <>Error</>,
});

const HomePage: FC = () => (
  <div>
    <LazyParent />
  </div>
);

export default HomePage;
