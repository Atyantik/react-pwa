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
  constructor(props) {
    super(props);
    this.state = {
      showScreenLoader: props.showScreenLoader
    };
  }
  showLoader() {
    this.setState({
      showScreenLoader: true
    });
  }
  hideLoader() {
    this.setState({
      showScreenLoader: false
    });
  }
  componentDidMount() {
    if (typeof window !== "undefined") {
      window.addEventListener("screenloadstart", this.showLoader.bind(this));
      window.addEventListener("screenloadend", this.hideLoader.bind(this));
    }
  }
  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("screenloadstart", this.showLoader.bind(this));
      window.removeEventListener("screenloadend", this.hideLoader.bind(this));
    }
  }
  render() {
    return (
      <div>
        {
          this.state.showScreenLoader &&
          (
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