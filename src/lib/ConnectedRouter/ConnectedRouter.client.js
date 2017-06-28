import React, { Component } from "react";
import PropTypes from "prop-types";

import { LOCATION_CHANGE } from "react-router-redux/reducer";

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

  handleLocationChange = location => {
    this.store.dispatch({
      type: LOCATION_CHANGE,
      payload: location
    });
  };

  componentWillMount() {
    const { store:propsStore, history } = this.props;
    this.store = propsStore || this.context.store;
    this.handleLocationChange(history.location);
  }

  componentDidMount() {
    const { history } = this.props;
    this.unsubscribeFromHistory = history.listen(this.handleLocationChange);
  }

  componentWillUnmount() {
    if (this.unsubscribeFromHistory) this.unsubscribeFromHistory();
  }

  render() {
    return <this.props.Router {...this.props} />;
  }
}