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
    const { open } = this.state;
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.setState({
      open: !open,
    });
  }

  closeMenuBar() {
    this.setState({ open: false });
  }

  showSavedItems(e) {
    //TODO
  }

  render() {
    const { open } = this.state;
    return (
      <div>
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="container">
            <div className="navbar-brand">
            <button
                type="button"
                onClick={e => this.showSavedItems(e)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a4a4a" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="feather feather-bookmark"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
              <div className='title' style={{
                    width: '100vh', 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 0,
                }}
                >
                  <Link to="/" className="navbar-item"><strong>RoNA</strong></Link>
              </div>
              <button
                type="button"
                onClick={e => this.toggleMenuBar(e)}
                className={`navbar-burger ${open ? 'is-active' : ''}`}
                aria-label="menu"
                aria-expanded="false"
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  height: '4rem',
                }}
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
            <div className={`navbar-menu ${open ? 'is-active' : ''}`}>
              <Link className="navbar-item" to="/home" onClick={() => this.closeMenuBar()} style={{textAlign:'center'}}>
                'i'm bored at home what do i do'
              </Link>
              <Link className="navbar-item" to="/global-local-css" onClick={() => this.closeMenuBar()} style={{textAlign:'center'}}>
                some humans are nice
              </Link>
              <Link className="navbar-item" to="/typescript-counter" onClick={() => this.closeMenuBar()} style={{textAlign:'center'}}>
                saved items
              </Link>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
