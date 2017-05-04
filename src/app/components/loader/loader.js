import React, { Component } from "react";
import * as styles from "./loader.scss";

export default class Loader extends Component {
  render() {
    return (
      <div className={styles["loader-section"]}>
        <div className={styles["screen-loader"]} />
      </div>
    );
  }
}