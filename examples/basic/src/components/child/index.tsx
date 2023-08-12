import { FC, useState, useEffect } from 'react';
import { useData, Head } from '@reactpwa/core';
import { ChildData } from '../../services/data';
import '../../resources/styles.scss';

export const ChildComponent: FC = () => {
  const childDetails = useData('child.data', ChildData);
  const titleText = `Welcome, ${childDetails.name}`;
  const [title, setTitle] = useState(titleText);
  useEffect(() => {
    setTimeout(() => {
      setTitle(`${titleText} - 1`);
    }, 4000);
  }, []);
  return (
    <>
      <Head>
        <title>{title} | Atyantik Technology</title>
        <meta
          property="og:image"
          content={
            'http://static01.nyt.com/images/2015/02/19/arts/international/'
            + '19iht-btnumbers19A/19iht-btnumbers19A-facebookJumbo-v2.jpg'
          }
        />
      </Head>
      <h1 className="redBg">Welcome, {childDetails.name}</h1>
    </>
  );
};

export default ChildComponent;
