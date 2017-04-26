import React from "react";
import { render } from "react-dom";
import { matchPath, BrowserRouter as Router, Route } from "react-router-dom";
import _ from "lodash";

let collectedRoutes = [];

const getModByPathname = () => {
  "use strict";
  let mod = false;
  _.each(window.routes, route => {
    console.log(window.location.pathname);
    if(matchPath(window.location.pathname, route)) {
      mod = route.bundleKey;
    }
  });
  return mod;
};

const initBrowserOperations = () => {
  "use strict";
  if (typeof window ==="undefined") {
    return;
  }

  // Load in respect to path
  let currentMod = getModByPathname();

  _.each(window.allJs, js => {
    if (js.indexOf(`mod-${currentMod}`) !== -1) {
      loadScripts(js, "js");
    }
  });

  console.log("am here");

  // monitor history change
  (function(history){
    var pushState = history.pushState;
    history.pushState = function(state) {
      if (typeof history.onpushstate == "function") {
        history.onpushstate({state: state});
      }
      // whatever else you want to do
      // maybe call onhashchange e.handler
      return pushState.apply(history, arguments);
    };
  })(window.history);
  window.onpopstate = history.onpushstate = function(state) {
    // Load in respect to path
    let currentMod = getModByPathname();

    _.each(window.allCss, css => {
      if (css.indexOf(`mod-${currentMod}`) !== -1) {
        loadScripts(css, "css");
      }
    });
    _.each(window.allJs, js => {
      if (js.indexOf(`mod-${currentMod}`) !== -1) {
        loadScripts(js, "js", () => {
          renderRoutes();
        });
      }
    });
  };
};

const enableHotReloading = () => {
  "use strict";
  if (module && module.hot && !window.hotLoaded) {
    module.hot.accept();
    //window.hotLoaded = true;
  }
};

const loadScripts = (path, type = "js", cb = () => {}) => {
  if (document.getElementById(path)) {
    cb();
    return;
  }
  let scriptReference;
  if (type === "js") { //if filename is a external JavaScript file
    scriptReference = document.createElement("script");
    scriptReference.setAttribute("type", "text/javascript");
    scriptReference.setAttribute("id", path);
    scriptReference.setAttribute("src", path);
    scriptReference.onload = cb;
    document.getElementsByTagName("body")[0].appendChild(scriptReference);
  } else if (type === "css") { //if filename is an external CSS file
    scriptReference = document.createElement("link");
    scriptReference.setAttribute("rel", "stylesheet");
    scriptReference.setAttribute("type", "text/css");
    scriptReference.setAttribute("id", path);
    scriptReference.setAttribute("href", path);
    scriptReference.onload = cb;
    document.getElementsByTagName("head")[0].appendChild(scriptReference);
  }
};

export const loadRoutes = (routes) => {
  "use strict";
  collectedRoutes = [...collectedRoutes, ...routes];
  renderRoutes();
};

const renderRoutes = () => {
  "use strict";
  if (typeof window !== "undefined") {
    render((
      <Router>
        <div>
          {_.map(collectedRoutes, (route, index) => {
            return <Route key={index} exact={route.exact} path={route.path} render={(props) => {
              return <route.component {...props} />;
            }} />;
          })}
        </div>
      </Router>
    ), document.getElementById("app"));
    enableHotReloading();
  }
}

initBrowserOperations();

export default () => {
  "use strict";
  return null;
};