import React, { Component } from "react";
import PropTypes from "prop-types";
import * as styles from "./loader.scss";

export default class Loader extends Component {
  static propTypes = {
    showScreenLoader: PropTypes.bool,
  };
  static defaultPropTypes = {
    showScreenLoader: false,
  };
  render() {
    return (
      <div>
        {
          this.props.showScreenLoader && (
            <div className={styles["loader-section"]}>
              <div className={styles["screen-loader"]} />
            </div>
          )
        }
        {this.props.children || null}
      </div>
    );
  }
}