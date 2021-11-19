import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>();
  const closeMenuBar = () => setIsOpen(false);
  const toggleMenuBar = (e: React.SyntheticEvent) => {
    e?.preventDefault?.();
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/" className=" navbar-item"><strong>ReactPWA</strong></Link>
            <button
              type="button"
              onClick={toggleMenuBar}
              className={`navbar-burger ${isOpen ? 'is-active' : ''}`}
              aria-label="menu"
              aria-expanded="false"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
              }}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
          <div className={`navbar-menu ${isOpen ? 'is-active' : ''}`}>
            <Link className="navbar-item" to="/home" onClick={closeMenuBar}>
              Home
            </Link>
            <Link className="navbar-item" to="/global-local-css" onClick={closeMenuBar}>
              Global &amp; Local CSS
            </Link>
            <Link className="navbar-item" to="/typescript-counter" onClick={closeMenuBar}>
              TypeScript Counter
            </Link>
            <Link className="navbar-item" to="/skeleton-loading" onClick={closeMenuBar}>
              Skeleton Loading
            </Link>
            <Link className="navbar-item" to="/login" onClick={closeMenuBar}>
              Auth
            </Link>
            <Link className="navbar-item" to="/contribute" onClick={closeMenuBar}>
              Contribute
            </Link>
            <a
              className="navbar-item has-text-danger"
              href="https://www.reactpwa.com"
              onClick={closeMenuBar}
            >
              Visit ReactPWA.com
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
