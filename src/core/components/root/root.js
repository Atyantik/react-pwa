import { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {loadScript, loadStyle} from "../../utils/utils";
import { screenLoaded } from "../loader/action";

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
    const gtag = function (){
      window.dataLayer.push(arguments);
    };
    gtag("js", new Date());
  
    gtag("config", "UA-107873544-1");
    loadScript("https://www.googletagmanager.com/gtag/js?id=UA-107873544-1").catch();
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