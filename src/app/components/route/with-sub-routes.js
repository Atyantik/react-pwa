import React from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import _ from "lodash";

class RouteWithSubRoutes extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      abstract: PropTypes.bool,
      bundleKey: PropTypes.string.isRequired,
      component: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.element
      ]),
      exact: PropTypes.bool,
      layout: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.element,
        PropTypes.func,
      ]),
      path: PropTypes.string,
      preLoadedData: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.shape({})
      ]),
      props: PropTypes.object,
      routes: PropTypes.arrayOf(PropTypes.shape({})),
      seo: PropTypes.shape({}),
    }).isRequired,
    api: PropTypes.any,
    storage: PropTypes.any
  };

  static defaultProps = {
    route: {
      abstract: false,
      exact: false,
      layout: false,
      preLoadedData: {},
      props: {},
      routes: [],
    }
  };

  renderSubRoutes(routes = []) {
    if (!routes.length) return null;
    return <div>
      {_.map(routes, (subRoute, i) => {
        return <RouteWithSubRoutes
          key={i}
          route={subRoute}
          api={this.props.api}
          storage={this.props.storage}
        />;
      })}
    </div>;
  }
  renderAbstract(route) {
    return (
      <route.component
        preLoadedData={route.preLoadedData}
        api={this.props.api}
        storage={this.props.storage}
        {...route.props}
      >
        { this.renderSubRoutes(route.routes) }
      </route.component>
    );
  }
  renderWithLayout(route) {
    if (!route.layout) return this.renderRoute(route);
    return <Route
      path={route.path}
      exact={route.exact}
      render={props => {
        return (
          <route.layout
            preLoadedData={route.preLoadedData}
            api={this.props.api}
            storage={this.props.storage}
            {...route.props}
            {...props}
          >
            {this.renderComponent(route, props)}
          </route.layout>
        );
      }}
    />;
  }
  renderComponent(route, props) {
    return <route.component
      preLoadedData={route.preLoadedData}
      routes={route.routes}
      api={this.props.api}
      storage={this.props.storage}
      {...route.props}
      {...props}
    />;
  }
  renderRoute(route) {
    return <Route
      path={route.path}
      exact={route.exact}
      render={props => this.renderComponent(route, props)}
    />;
  }
  render() {
    const { route } = this.props;
    if (route.abstract) {
      return this.renderAbstract(route);
    }
    if (route.layout) {
      return this.renderWithLayout(route);
    }
    return this.renderRoute(route);
  }
}

export default RouteWithSubRoutes;