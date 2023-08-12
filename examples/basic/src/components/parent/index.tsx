import { FC } from 'react';
import {
  useData, Head, lazy,
} from '@reactpwa/core';
import { ParentData } from '../../services/data';
import { Skeleton } from '../skeleton';
import styles from './styles.scss';

const LazyChild = lazy({
  element: () => import('@components/child'),
  skeleton: Skeleton,
});

export const ParentComponent: FC = () => {
  const parentDetails = useData('parent.data', ParentData);
  return (
    <>
      <Head>
        <title>Welcome, {parentDetails.name} | Atyantik</title>
        <meta property="og:image" content="https://picsum.photos/200/300" />
        <meta name="theme-color" content="#317EFB" />
      </Head>
      <div>
        <h1 className={styles.red}>Welcome, {parentDetails.name}</h1>
        <div className={styles.logo}></div>
      </div>
      <LazyChild />
    </>
  );
};

export default ParentComponent;
