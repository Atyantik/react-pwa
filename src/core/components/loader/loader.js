import React, { Component } from "react";
import { connect } from "react-redux";
import { SCREEN_STATE, SCREEN_LOADING } from "./action";
import * as styles from "./loader.scss";

@connect( state => {
  return {
    showScreenLoader: state.screenLoader[SCREEN_STATE] === SCREEN_LOADING
  };
})
export default class Loader extends Component {
  render() {
    return (
      <div>
        {
          this.props.showScreenLoader &&
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