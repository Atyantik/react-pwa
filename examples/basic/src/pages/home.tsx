import { useSyncData, Head } from '@reactpwa/core';
import { FC } from 'react';
import { HomeData } from '../services/data';
import styles from './styles.scss';

const HomePage: FC<{ name?: string }> = ({ name }) => {
  const { data: homeData, syncScript } = useSyncData('home.data', HomeData);
  return (
    <div>
      <Head resolve={true}>
        <title>
          This is home page
          {name ? ` for ${name}` : ''}
        </title>
      </Head>
      <h1>Home Page</h1>
      <p className={styles.italic}>{homeData.content}</p>
      {syncScript}
    </div>
  );
};

export default HomePage;
