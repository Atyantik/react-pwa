import React, { Component } from "react";
import PropTypes from "prop-types";
import * as styles from "./error-500.scss";

export default class ErrorPage extends Component {
  static propTypes = {
    error: PropTypes.instanceOf(Error),
  };
  render () {
    "use strict";
    const { staticContext, error } = this.props;
    if (staticContext) {
      staticContext.status = 500;
    }

    const showStack = process.env.NODE_ENV !== "production";

    return (
      <div className="container text-center mt-5">
        <h1 className="mt-5">500</h1>
        <p className="h3">Server error occurred.</p>
        {
          true ||
          ( !!error.stack &&
          showStack ) &&
          (
            <pre className={styles.error}>
              {error.stack}
            </pre>
          )
        }
      </div>
    );
  }
}
