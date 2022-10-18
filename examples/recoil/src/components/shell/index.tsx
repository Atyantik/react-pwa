import { Outlet, Link, Head } from '@reactpwa/core';
import { RecoilRoot } from 'recoil';

/**
 * @todo: Check for header re-render, do not touch script if not updated
 */
const Shell: React.FC = () => (
  <RecoilRoot>
    <Head>
      <title>Example Site</title>
    </Head>
    <header>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/about">About</Link>
      </nav>
    </header>
    <div className="container">
      <Outlet />
    </div>
  </RecoilRoot>
);

export default Shell;
