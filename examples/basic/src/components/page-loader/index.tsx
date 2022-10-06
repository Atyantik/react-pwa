import ReactPWALogo from './react-pwa-logo.png';
import styles from './styles.scss';

export const PageLoader: React.FC = () => (
  <div className={styles.box}>
    <img
      className={styles.img}
      src={ReactPWALogo}
    />
    <div className={styles.loader} />
  </div>
);
