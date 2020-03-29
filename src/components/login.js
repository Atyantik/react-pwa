import React from 'react';
import { Redirect } from 'react-router-dom';
import GuestLayout from './guest-layout';
import cookie from '../libs/cookie';
import Authenticator from './fake-authenticator';

export default class Login extends React.Component {
  onLoginRedirectUrl = '/dashboard';

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loggedIn: false,
      error: '',
      errorMsg: '',
    };
  }

  componentDidMount() {
    const isLoggedIn = Authenticator.isLoggedIn();
    if (isLoggedIn) {
      this.setState({
        loaded: true,
        loggedIn: true,
      });
    } else {
      this.setState({
        loaded: true,
      });
    }
  }

  handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const loginData = new FormData(e.target);
    const username = loginData.get('username');
    const password = loginData.get('password');
    if (username !== 'demo' || password !== 'demo') {
      this.setState({
        error: username !== 'demo' ? 'username' : 'password',
        errorMsg: 'Please use username:password as demo:demo',
      });
    } else {
      cookie.setItem('secretKey', 'allowmein');
      this.setState({
        loggedIn: true,
      });
    }
  }

  render() {
    const {
      loggedIn,
      error,
      errorMsg,
      loaded,
    } = this.state;
    if (!loaded) return null;
    if (loggedIn) {
      return <Redirect push={false} to={this.onLoginRedirectUrl} />;
    }
    return (
      <GuestLayout>
        <div className="columns is-centered p-t-xl p-r-md p-l-md">
          <div className="column is-half">
            <div className="box">
              <h1 className="title">Login</h1>
              <form onSubmit={e => this.handleSubmit(e)}>
                <div className="field">
                  <label className="label" htmlFor="username">
                    username
                    <div className="control">
                      <input
                        defaultValue="demo"
                        id="username"
                        name="username"
                        className={`input ${error === 'username' ? 'is-danger' : ''}`}
                        type="text"
                        placeholder="Username input"
                      />
                    </div>
                  </label>
                </div>
                <div className="field">
                  <label className="label" htmlFor="password">
                    Password
                    <div className="control">
                      <input
                        defaultValue="demo"
                        id="password"
                        name="password"
                        className={`input ${error === 'password' ? 'is-danger' : ''}`}
                        type="password"
                        placeholder="********"
                      />
                    </div>
                  </label>
                </div>
                <div className="field is-grouped">
                  <div className="control">
                    <button type="submit" className="button is-link">Login</button>
                  </div>
                </div>
                {
                  error !== '' && (
                    <p className="help is-danger">
                      {errorMsg}
                    </p>
                  )
                }
              </form>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }
}
