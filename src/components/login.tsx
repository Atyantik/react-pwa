import React, { useState, useEffect } from 'react';
import { Redirect } from '@pawjs/pawjs';
import GuestLayout from './guest-layout';
import { isLoggedIn, login } from './fake-authenticator';

const Login: React.FC = () => {
  const onLoginRedirectUrl = '/dashboard';
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorComponent, setErrorComponent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.SyntheticEvent) => {
    e?.preventDefault?.();
    const loginData = new FormData(e.target as HTMLFormElement);
    const username = loginData.get('username');
    const password = loginData.get('password');
    if (username !== 'demo' || password !== 'demo') {
      setErrorComponent(username !== 'demo' ? 'username' : 'password');
      setErrorMessage('Please use username:password as demo:demo');
    } else {
      login();
      setIsAuthenticated(true);
    }
  };

  useEffect(
    () => {
      setInitialized(true);
      if (isLoggedIn()) {
        setIsAuthenticated(true);
      }
    },
    [],
  );

  if (!initialized) return null;
  if (isAuthenticated) {
    return <Redirect to={onLoginRedirectUrl} />;
  }
  return (
    <GuestLayout>
      <div className="columns is-centered p-t-xl p-r-md p-l-md">
        <div className="column is-half">
          <div className="box">
            <h1 className="title">Login</h1>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label" htmlFor="username">
                  username
                  <div className="control">
                    <input
                      defaultValue="demo"
                      id="username"
                      name="username"
                      className={`input ${errorComponent === 'username' ? 'is-danger' : ''}`}
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
                      className={`input ${errorComponent === 'password' ? 'is-danger' : ''}`}
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
                errorComponent !== '' && (
                  <p className="help is-danger">
                    {errorMessage}
                  </p>
                )
              }
            </form>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default Login;
