import React from 'react';
import { Redirect } from 'react-router-dom';
import Layout from './layout';
import cookie from '../libs/cookie';

export default class Login extends React.Component {
  onLoginRedirectUrl = '/dashboard';

  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
    };
  }

  componentDidMount() {
    const isLoggedIn = cookie.getItem('secretKey') === 'allowmein';
    if (isLoggedIn) {
      this.setState({
        loggedIn: true,
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
        error: true,
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
    if (this.state.loggedIn) {
      return <Redirect push={false} to={this.onLoginRedirectUrl} />;
    }
    return (
      <Layout>
        <div className="columns is-centered">
          <div className="column is-half">
            <div className="box">
              <h1 className="title">Login</h1>
              <form onSubmit={e => this.handleSubmit(e)} className="">
                <div className="field">
                  <label className="label">username</label>
                  <div className="control">
                    <input name="username" className="input is-danger" type="text" placeholder="Username input" />
                  </div>
                  <p className="help is-danger">This email is invalid</p>
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input name="password" className="input" type="password" placeholder="********" />
                  </div>
                </div>
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-link">Login</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
