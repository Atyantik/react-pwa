import React, { Component } from "react";
import PropTypes from "prop-types";

export default class ConnectedRouter extends Component {
  static propTypes = {
    store: PropTypes.object,
    history: PropTypes.object,
    children: PropTypes.node,
    Router: PropTypes.any.isRequired,
  };

  static contextTypes = {
    store: PropTypes.object
  };

  render() {
    return <this.props.Router {...this.props} />;
  }
}
