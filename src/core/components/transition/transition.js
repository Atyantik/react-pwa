import React, { Component } from "react";
import { connect } from "react-redux";
import {
  SCREEN_STATE_PAGE_ENTER,
  SCREEN_STATE_PAGE_EXIT
} from "../screen/action";

@connect( state => {
  return {
    screenAnimation: state.screen.animation
  };
})
export default class Transition extends Component {
  animationState = "stopped";
  componentWillReceiveProps(nextProps) {
    if (this.animationState === "starting") {
      this.animationState = "started";
    }
    if (nextProps.screenAnimation === SCREEN_STATE_PAGE_EXIT) {
      this.animationState = "starting";
    }
    if (nextProps.screenAnimation === SCREEN_STATE_PAGE_ENTER) {
      this.animationState = "stopped";
    }
  }
  
  render() {
    const { className, onEnterClassName, onExitClassName } = this.props;
    return (
      <div className={`${className} ${this.props.screenAnimation === SCREEN_STATE_PAGE_EXIT ? onExitClassName: onEnterClassName}`}>
        {this.props.children || null}
      </div>
    );
  }
}