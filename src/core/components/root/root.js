import { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {loadScript, loadStyle} from "../../utils/utils";
import { screenLoaded } from "../screen/action";

const __development = process.env.NODE_ENV === "development";

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
  loadGoogleAnalytics() {
    if(typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });
    loadScript("https://www.googletagmanager.com/gtm.js?id=GTM-TW9PBND").catch();
  }
  
  componentDidMount() {
    // Trigger screenLoaded once all the preload-css are loaded
    this.loadPreloadCSS().then(() => {
      this.props.dispatch(screenLoaded());
    });
    // Load google analytics
    !__development && this.loadGoogleAnalytics();
  }
  render() {
    return this.props.children || null;
  }
}