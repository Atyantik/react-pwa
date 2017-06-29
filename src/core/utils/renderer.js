import React from "react";
import { Provider } from "react-redux";
import { render as DefaultRender } from "react-dom";
import ConnectedRouter from "core/libs/ConnectedRouter";
import { AppContainer as HotAppContainer } from "react-hot-loader";
import _ from "lodash";

import {
  Router as DefaultRouter,
  Route as DefaultRoute,
  Switch as DefaultSwitch,
} from "react-router-dom";

import clientStorage from "core/libs/storage/storage.server";
import clientApi from "core/libs/api/api";

import Loader from "core/components/loader/loader";
import NotFoundPage from "app/components/error/404";
import ErrorPage from "app/components/error/500";
import RouteWithSubRoutes from "core/components/route/with-sub-routes";

import { getRouteFromPath } from "./bundler";

export const renderNotFoundPage = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  Route = DefaultRoute,
  history,
  store,
  context,
  renderRoot = null
}, callback = () => null) => {


  let component = (
    <Provider store={store}>
      <ConnectedRouter Router={Router} context={context} history={history}>
        <Switch>
          <Route component={NotFoundPage} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  );
  // If render is set false explicitly then just return the component
  if (!render) {
    return component;
  }
  // render 404
  return render(component, renderRoot, callback);
};

export const renderErrorPage = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  Route = DefaultRoute,
  context,
  history,
  store,
  renderRoot = null,
  error
}, callback = () => null) => {

  context = context || {};
  let component = (
    <Provider store={store}>
      <ConnectedRouter Router={Router} context={context} history={history} >
        <Switch>
          <Route onRender={() => {
            return <ErrorPage error={error} />;
          }} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  );
  if (!render) {
    return component;
  }
  // Render 500
  return render(component, renderRoot, callback);
};

export const renderRoutesByUrl = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  api = clientApi,
  storage = clientStorage,
  routes,
  url,
  context = {},
  history,
  store,
  renderRoot = null
}, callback = () => null) => {
  const currentRoutes = url ? getRouteFromPath(routes, url): routes;

  context.api = api;
  context.storage = storage;

  let component = (
    <HotAppContainer>
      <Provider store={store}>
        <ConnectedRouter
          context={context}
          location={url}
          history={history}
          Router={Router}
        >
          <Loader>
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
        </ConnectedRouter>
      </Provider>
    </HotAppContainer>
  );
  if (!render) {
    return component;
  }
  render(component, renderRoot, callback);
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
    api,
    store
  }
) => {
  let promises = [];
  _.each(routes, r => {

    // Load data and add it to route itself
    if (r.preLoadData) {
      promises.push((() => {

        // Pass route as reference so that we can modify it while loading data
        let returnData = r.preLoadData({route: r, match: r.match, storage, api, store});
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
