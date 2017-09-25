import { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { loadStyle } from "../../utils/utils";
import { screenLoaded } from "../loader/action";

@connect (state => {
  return {
    screen: state.screen
  };
})
export default class CoreRoot extends Component {
  
  async loadPreloadCSS() {
    let linksPromise = [];
    if (typeof window !== "undefined" && typeof window.document !== "undefined") {
      _.forEach(window.document.querySelectorAll("link[rel=preload]"), link => {
        linksPromise.push(loadStyle(link.href));
      });
      if (linksPromise.length) {
        await Promise.all(linksPromise);
      }
    }
    return Promise.resolve();
  }
  
  componentDidMount() {
    // Trigger screenLoaded once all the preload-css are loaded
    this.loadPreloadCSS().then(() => {
      this.props.dispatch(screenLoaded());
    });
  }
  render() {
    return this.props.children || null;
  }
}