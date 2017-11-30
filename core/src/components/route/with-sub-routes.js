import React from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { renderSubRoutes } from "../../utils/renderer";

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
    storage: PropTypes.any,
    parentPreLoadedData: PropTypes.any,
  };

  static defaultProps = {
    route: {
      abstract: false,
      exact: false,
      layout: false,
      preLoadedData: {},
      props: {},
      routes: [],
    },
    parentPreLoadedData: {},
  };
  
  renderAbstract(route) {
    return (
      <route.component
        preLoadedData={route.preLoadedData}
        parentPreLoadedData={this.props.parentPreLoadedData}
        api={this.props.api}
        storage={this.props.storage}
        {...route.props}
        routes={route.routes}
      >
        {
          renderSubRoutes({
            props: {
              api: this.props.api,
              storage: this.props.storage,
              preLoadedData: route.preLoadedData,
              routes: route.routes
            }
          })
        }
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
            parentPreLoadedData={this.props.parentPreLoadedData}
            preLoadedData={route.preLoadedData}
            api={this.props.api}
            storage={this.props.storage}
            {...route.props}
            {...props}
          >
            {
              route.abstract ?
                this.renderAbstract(route): this.renderComponent(route, props)
            }
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
      parentPreLoadedData={this.props.parentPreLoadedData}
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
    if (route.layout) {
      return this.renderWithLayout(route);
    }
    if (route.abstract) {
      return this.renderAbstract(route);
    }
    return this.renderRoute(route);
  }
}

export default RouteWithSubRoutes;