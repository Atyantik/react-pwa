import {
  useSyncData, ErrorBoundary, Head,
} from '@reactpwa/core';
import { Suspense, FC, lazy } from 'react';
import { ParentData } from '../../services/data';
import { Skeleton } from '../skeleton';
import styles from './styles.scss';

const LazyChild = lazy(() => import('@components/child'));

export const ParentComponent: FC = () => {
  const {
    data: parentDetails,
    syncScript,
  } = useSyncData('parent.data', ParentData);
  return (
    <>
      <Head>
        <title>Welcome, {parentDetails.name} | Atyantik</title>
        <meta
          property="og:image"
          content="https://picsum.photos/200/300"
        />
        <meta name="theme-color" content="#317EFB" />
      </Head>
      <h1 className={styles.red}>Welcome, { parentDetails.name }</h1>
      <ErrorBoundary FallbackComponent={() => <>Error</>}>
        <Suspense fallback={<Skeleton />}>
          <LazyChild />
        </Suspense>
      </ErrorBoundary>
      {syncScript}
    </>
  );
};

export default ParentComponent;
