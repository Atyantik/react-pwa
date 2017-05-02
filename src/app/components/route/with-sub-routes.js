import React from "react";
import { Route } from "react-router-dom";
import _ from "lodash";

export default (route) => {
  return (
    <Route
      path={route.path}
      exact={_.get(route, "exact", false)}
      render={props => (
        <route.component
          {...props}
          routes={_.get(route, "routes", "")}
          bundleKey={_.get(route, "bundleKey", "")}
        />
      )}
    />
  );
};