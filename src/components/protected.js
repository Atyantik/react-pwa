import React from 'react';
import { Route } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import cookie from '../libs/cookie';

export default class Protected extends React.Component {
  redirectUrl = '/login';

  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
      allow: false,
    };
  }

  componentDidMount() {
    // Add your custom validation
    const isLoggedIn = cookie.getItem('secretKey') === 'allowmein';

    if (!isLoggedIn) {
      this.setState({
        initialized: true,
        allow: false,
      });
    } else {
      this.setState({
        initialized: true,
        allow: true,
      });
    }
  }

  render() {
    if (!this.state.initialized) {
      return null;
    }
    if (this.state.allow) {
      return this.props.children;
    }
    return (
      <Route render={({ staticContext }) => {
        if (staticContext) staticContext.status = 403;
        return <Redirect to={this.redirectUrl} />;
      }}
      />
    );
  }
}
