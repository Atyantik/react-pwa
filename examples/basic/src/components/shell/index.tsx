import { Outlet, Link } from '@reactpwa/core';
import styles from './styles.scss';

/**
 * @todo: Check for header re-render, do not touch script if not updated
 */
const Shell: React.FC = () => (
  <>
    <header className={styles.header}>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
      </nav>
    </header>
    <div className="container">
      <Outlet />
    </div>
  </>
);

export default Shell;
