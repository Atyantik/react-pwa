import React, {Component} from "react";
import PropTypes from "prop-types";

export default class OfflinePage extends Component {
  static propTypes = {
    error: PropTypes.instanceOf(Error),
  };
  render () {
    const { staticContext } = this.props;
    if (staticContext) {
      staticContext.status = 500;
    }

    return (
      <div className="container text-center mt-5">
        <h1 className="mt-5">Offline</h1>
        <p className="h3">Please connect to network to load content for this page.</p>
      </div>
    );
  }
}
