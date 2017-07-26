import React, { Component } from "react";
import PropTypes from "prop-types";
const SHOW_TIMEOUT = 50;

/**
 A component for configurable skip loading.
 @examples
 <Fold skip={true}>
 <Footer />
 </Fold>
 @returns {ReactElement} The rendered component
 */

export default class Fold extends Component {
  static propTypes = {
    /**
     Children to render when visible
     */
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
  
    /**
     Pass in another element to render when skipping server side rendering
     */
    placeholder: PropTypes.element,
  
    /**
     Sets the className of the default placeholder
     */
    placeholderClassName: PropTypes.string,
  
    /**
     Sets the style of the default placeholder
     */
    placeholderStyle: PropTypes.object,
  
    /**
     Tell to skip server side rendering
     */
    skip: PropTypes.bool
  };
  
  static defaultProps = {
    skip: true
  };
  
  constructor(props, context) {
    super(props, context);
    
    if (props.skip) {
      this.state = { visible: false };
    }
    
    this._onShow = this._onShow.bind(this);
  }
  
  componentDidMount() {
    if (!this.state.visible) {
      this.timeout = setTimeout(this._onShow, SHOW_TIMEOUT);
    }
  }
  
  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }
  
  _onShow() {
    this.setState({ visible: true });
  }
  
  render() {
    if (this.state.visible) {
      return this.props.children;
    }
    
    const {
      placeholder,
      placeholderClassName,
      placeholderStyle
    } = this.props;
    
    return placeholder || (
      <div className={placeholderClassName} style={placeholderStyle} />
    );
  }
}
