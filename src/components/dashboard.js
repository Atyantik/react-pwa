import React from 'react';
import Protected from './protected';

export default class Dashboard extends React.Component {
  render() {
    return (
      <Protected>
        <h1>Dashboard</h1>
      </Protected>
    );
  }
}
