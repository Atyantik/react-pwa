import React from "react";
import { Route, Switch } from "react-router-dom";
import _ from "lodash";

class RouteWithSubRoutes extends React.Component {

  renderWithAbstractComponent(route) {
    return (
      <route.component>
        {
          !!_.get(route, "routes", []).length && (
            <Switch>
              {_.map(route.routes, (subRoute, i) => {
                return <RouteWithSubRoutes key={i} {...subRoute}/>;
              })}
            </Switch>
          )
        }
      </route.component>
    );
  }

  renderWithLayout(route, props) {
    return (
      <route.layout
        {...props}
        preLoadedData={_.get(route, "preLoadedData", "")}
        bundleKey={_.get(route, "bundleKey", "")}
        routes={_.get(route, "routes", "")}
      >
        { this.renderComponent(route) }
      </route.layout>
    );
  }

  renderComponent(route, props) {
    return (
      <route.component
        {...props}
        preLoadedData={_.get(route, "preLoadedData", "")}
        routes={_.get(route, "routes", [])}
        bundleKey={_.get(route, "bundleKey", "")}
      />
    );
  }

  render() {
    const route = this.props;

    if (_.get(route, "abstract", false)) {
      return this.renderWithAbstractComponent(route);
    }

    return (
      <Route
        path={route.path}
        exact={_.get(route, "exact", false)}
        render={props => {
          if (typeof route.layout !== "undefined" && route.layout) {
            // render with layout
            return this.renderWithLayout(route, props);
          }

          // User does not event want to render default layout
          return this.renderComponent(route, props);
        }}
      />
    );
  }
}

export default RouteWithSubRoutes;