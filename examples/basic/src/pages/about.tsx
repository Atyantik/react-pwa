import { FC, lazy, Suspense } from 'react';
import { Skeleton } from '@components/skeleton';

const LazyParent = lazy(() => import('@components/parent'));

const HomePage: FC = () => (
    <div>
      <Suspense fallback={<Skeleton />}>
        <LazyParent />
      </Suspense>
    </div>
);

export default HomePage;
