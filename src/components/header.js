import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

export default class Header extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  toggleMenuBar(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.setState({
      open: !this.state.open,
    });
  }

  closeMenuBar() {
    this.setState({ open: false });
  }

  render() {
    return (
      <div>
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <Link to="/" className=" navbar-item"><strong>ReactPWA</strong></Link>
            <a
              onClick={e => this.toggleMenuBar(e)}
              role="button"
              className={`navbar-burger ${this.state.open ? 'is-active' : ''}`}
              aria-label="menu"
              aria-expanded="false"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </a>
          </div>
          <div className={`navbar-menu ${this.state.open ? 'is-active' : ''}`}>
            <Link className="navbar-item" to="/home" onClick={() => this.closeMenuBar()}>
              Home
            </Link>
            <Link className="navbar-item" to="/global-css" onClick={() => this.closeMenuBar()}>
              Global CSS
            </Link>
            <Link className="navbar-item" to="/login" onClick={() => this.closeMenuBar()}>
              Login
            </Link>
          </div>
        </nav>
      </div>
    );
  }
}
