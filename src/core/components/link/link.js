import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import { ANIMATE_PAGE, animateSection } from "../screen/action";

@connect(state => {
  return {
    reduxAnimateSection: state.screen.animate_section
  };
})
export default class Link extends Component {
  static propTypes = {
    animateSection: PropTypes.string,
    onClick: PropTypes.func,
  };
  
  static defaultProps = {
    animateSection: ANIMATE_PAGE,
    onClick: () => null,
  };
  onClick(...args) {
    if (this.props.reduxAnimateSection !== this.props.animateSection) {
      this.props.dispatch(animateSection(this.props.animateSection));
    }
    return this.props.onClick(...args);
  }
  
  render() {
    // eslint-disable-next-line
    const { animateSection, onClick, dispatch, reduxAnimateSection, ...otherProps } = this.props;
    return <RouterLink {...otherProps} onClick={(...args) => this.onClick(...args)}>{this.props.children}</RouterLink>;
  }
}
