import React from 'react';
import { Redirect } from '@pawjs/pawjs';
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
    const { initialized, allow } = this.state;
    // eslint-disable-next-line
    const { children } = this.props;
    if (!initialized) {
      return null;
    }
    if (allow) {
      return children;
    }
    return (
      <Redirect to={this.redirectUrl} />
    );
  }
}
