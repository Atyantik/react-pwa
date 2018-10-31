import React from 'react';
import Header from './header';
import Footer from './footer';

export default class GuestLayout extends React.PureComponent {
  render() {
    // eslint-disable-next-line
    const { children } = this.props;
    return (
      <div>
        <Header />
        {children}
        <br />
        <Footer />
      </div>
    );
  }
}
