import React from "react";
import { Route } from "react-router-dom";
import _ from "lodash";

export default (route) => {
  return (
    <Route
      path={route.path}
      exact={_.get(route, "exact", false)}
      render={props => {
        if (typeof route.layout !== "undefined" && route.layout) {
          // render with layout
          return (
            <route.layout
              {...props}
              preLoadedData={_.get(route, "preLoadedData", "")}
              bundleKey={_.get(route, "bundleKey", "")}
              routes={_.get(route, "routes", "")}
            >
              <route.component
                {...props}
                preLoadedData={_.get(route, "preLoadedData", "")}
                routes={_.get(route, "routes", "")}
                bundleKey={_.get(route, "bundleKey", "")}
              />
            </route.layout>
          );
        }
        // User does not event want to render default layout
        return (
          <route.component
            {...props}
            preLoadedData={_.get(route, "preLoadedData", "")}
            routes={_.get(route, "routes", "")}
            bundleKey={_.get(route, "bundleKey", "")}
          />
        );
      }}
    />
  );
};