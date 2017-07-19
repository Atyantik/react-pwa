import React, { Component } from "react";
import { connect } from "react-redux";
import { SCREEN_STATE_LOADING } from "./action";
import * as styles from "./loader.scss";

@connect( state => {
  return {
    screenState: state.screen.state
  };
})
export default class Loader extends Component {
  render() {
    return (
      <div>
        {
          this.props.screenState === SCREEN_STATE_LOADING &&
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