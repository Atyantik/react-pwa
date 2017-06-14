import React from "react";
import { render as DefaultRender } from "react-dom";
import { AppContainer as HotAppContainer } from "react-hot-loader";
import _ from "lodash";

import {
  Router as DefaultRouter,
  Route as DefaultRoute,
  Switch as DefaultSwitch,
} from "react-router-dom";

import clientStorage from "lib/storage";
import clientApi from "lib/api";

import Loader from "app/components/loader";
import NotFoundPage from "app/components/error/404";
import ErrorPage from "app/components/error/500";
import RouteWithSubRoutes from "app/components/route/with-sub-routes";

import { getRouteFromPath } from "./bundler";

export const renderNotFoundPage = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  Route = DefaultRoute,
  history,
  context,
  renderRoot = null
}) => {

  let component = (
    <Router context={context} history={history} >
      <Switch>
        <Route component={NotFoundPage} />
      </Switch>
    </Router>
  );
  // If render is set false explicitly then just return the component
  if (!render) {
    return component;
  }
  // render 404
  return render(component, renderRoot);
};

export const renderErrorPage = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  Route = DefaultRoute,
  context,
  history,
  renderRoot = null,
  error
}) => {

  context = context || {};
  let component = (
    <Router context={context} history={history} >
      <Switch>
        <Route onRender={() => {
          return <ErrorPage error={error} />;
        }} />
      </Switch>
    </Router>
  );
  if (!render) {
    return component;
  }
  // Render 500
  return render(component, renderRoot);
};

export const renderRoutesByUrl = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  api = clientApi,
  storage = clientStorage,
  routes,
  url,
  context,
  history,
  renderRoot = null,
  showScreenLoader = false,
}) => {
  const currentRoutes = url ? getRouteFromPath(routes, url): routes;

  context = context || {};

  context.api = api;
  context.storage = storage;

  let component = (
    <HotAppContainer>
      <Router
        context={context}
        location={url}
        history={history}
      >
        <Loader showScreenLoader={showScreenLoader}>
          <Switch>
            {_.map(currentRoutes, (route, i) => {
              return <RouteWithSubRoutes
                key={i}
                route={route}
                storage={storage}
                api={api}
              />;
            })}
          </Switch>
        </Loader>
      </Router>
    </HotAppContainer>
  );
  if (!render) {
    return component;
  }
  render(component, renderRoot);
};

export const renderSubRoutes = (component) => {
  const { routes = [], api, storage } = component.props;
  return _.map(routes, (route, i) => {
    return <RouteWithSubRoutes
      key={i}
      route={route}
      api={api}
      storage={storage}
    />;
  });
};

/**
 * Return of array of promises that needs to be reloaded
 * @param routes
 * @param storage
 * @param api
 * @returns {Array}
 */
export const getPreloadDataPromises = (
  {
    routes,
    storage,
    api
  }
) => {
  let promises = [];
  _.each(routes, r => {

    // Load data and add it to route itself
    if (r.preLoadData) {
      promises.push((() => {

        // Pass route as reference so that we can modify it while loading data
        let returnData = r.preLoadData({route: r, match: r.match, storage, api});
        if (returnData && _.isFunction(returnData.then)) {
          return returnData.then(data => {
            return r.preLoadedData = data;
          }).catch(err => {
            throw err;
          });
        }
        return r.preLoadedData = returnData;
      })());
    }
  });
  return promises;
};
