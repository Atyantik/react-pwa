import React from 'react';
import Header from './header';
import Footer from './footer';

export default class Layout extends React.PureComponent {
  render() {
    // eslint-disable-next-line
    const { children } = this.props;
    return (
      <div>
        <Header />
        {children}
        <Footer />
      </div>
    );
  }
}
