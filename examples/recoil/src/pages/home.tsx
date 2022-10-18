import { useData, Head } from '@reactpwa/core';
import { FC } from 'react';
import { HomeData } from '../services/data';
import styles from './styles.scss';

const HomePage: FC<{ name?: string }> = ({ name }) => {
  const homeData = useData('home.data', HomeData);
  return (
    <div>
      <Head>
        <title>
          This is home page
          {name ? `for ${name}` : ''}
        </title>
      </Head>
      <h1>Home Page</h1>
      <p className={styles.italic}>{homeData.content}</p>
    </div>
  );
};

export default HomePage;
