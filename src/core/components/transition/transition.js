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
  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }
  componentDidMount() {
    this.setState({mounted: true});
  }
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
  getOnEnterClassName(props) {
    return this.state.mounted ? props.onEnterClassName: "";
  }
  
  render() {
    const { style, className, onExitClassName } = this.props;
    const onEnterClassName = this.getOnEnterClassName(this.props);
    return (
      <div style={style} className={`${className} ${this.props.screenAnimation === SCREEN_STATE_PAGE_EXIT ? onExitClassName: onEnterClassName}`}>
        {this.props.children || null}
      </div>
    );
  }
}