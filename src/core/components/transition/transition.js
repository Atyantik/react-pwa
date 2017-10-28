import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  ANIMATE_PAGE,
  SCREEN_STATE_PAGE_EXIT
} from "../screen/action";

@connect( state => {
  return {
    screenAnimation: state.screen.animation,
    animateSection: state.screen.animate_section
  };
})
export default class Transition extends Component {
  static propTypes = {
    sectionName: PropTypes.string,
  };
  static defaultProps = {
    sectionName: ANIMATE_PAGE
  };
  shouldComponentUpdate(nextProps) {
    return nextProps.animateSection === this.props.sectionName &&
      this.props.screenAnimation !== nextProps.screenAnimation;
  }
  
  render() {
    const { style, className, onEnterClassName, onExitClassName } = this.props;
    let animationClass = onEnterClassName;
    if (
      this.props.screenAnimation === SCREEN_STATE_PAGE_EXIT &&
      this.props.animateSection === this.props.sectionName
    ) {
      animationClass = onExitClassName;
    }
    return (
      <div style={style} className={`${className} ${animationClass}`}>
        {this.props.children || null}
      </div>
    );
  }
}