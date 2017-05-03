import React from "react";
import { Route } from "react-router-dom";
import _ from "lodash";

import DefaultLayout from "../layout";

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
              bundleKey={_.get(route, "bundleKey", "")}
              routes={_.get(route, "routes", "")}
            >
              <route.component
                {...props}
                routes={_.get(route, "routes", "")}
                bundleKey={_.get(route, "bundleKey", "")}
              />
            </route.layout>
          );
        }
        // User does not event want to render default layout
        if (typeof route.layout !== "undefined" && !route.layout) {
          return (
            <route.component
              {...props}
              routes={_.get(route, "routes", "")}
              bundleKey={_.get(route, "bundleKey", "")}
            />
          );
        }
        return (
          <DefaultLayout
            {...props}
            bundleKey={_.get(route, "bundleKey", "")}
            routes={_.get(route, "routes", "")}
          >
            <route.component
              {...props}
              routes={_.get(route, "routes", "")}
              bundleKey={_.get(route, "bundleKey", "")}
            />
          </DefaultLayout>
        );
      }}
    />
  );
};