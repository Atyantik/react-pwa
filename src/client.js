import React from "react";
import assets from "./config/assets";

const initBrowserOperations = () => {
  "use strict";
  if (typeof window ==="undefined") {
    return;
  }
  if (module && module.hot && !window.hotLoaded) {
    module.hot.accept();
    window.hotLoaded = true;
  }
};

const loadRouteScripts = (path, type = "js") => {
  let scriptReference;
  if (type === "js") { //if filename is a external JavaScript file
    scriptReference = document.createElement("script");
    scriptReference.setAttribute("type", "text/javascript");
    scriptReference.setAttribute("src", path);
    document.getElementsByTagName("body")[0].appendChild(scriptReference);
  } else if (type === "css") { //if filename is an external CSS file
    scriptReference = document.createElement("link");
    scriptReference.setAttribute("rel", "stylesheet");
    scriptReference.setAttribute("type", "text/css");
    scriptReference.setAttribute("href", path);
    document.getElementsByTagName("head")[0].appendChild(scriptReference);
  }
};

console.log("Tirth Bodawala");

export default () => {
  "use strict";
  console.log("load");
};