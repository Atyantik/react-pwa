import React from "react";
import { Provider } from "react-redux";
import { hydrate as DefaultRender } from "react-dom";
import { AppContainer as HotAppContainer } from "react-hot-loader";
import _ from "lodash";

import ConnectedRouter from "../libs/ConnectedRouter";

import {
  Router as DefaultRouter,
  Route as DefaultRoute,
  Switch as DefaultSwitch,
} from "react-router-dom";

import clientStorage from "../libs/storage";
import clientApi from "../libs/api";


import RouteWithSubRoutes from "../components/route/with-sub-routes";
import { getRouteFromPath } from "./bundler";
import componentMap from "../../config/classMap";

/**
 * Get component via componentMap in settings
 * @param componentReference
 */
const getComponent = (componentReference) => {
  const component = componentMap[componentReference] || false;
  if (!component) throw new Error(`Cannot find component with reference ${componentReference}`);
  return component;
};

const RootComponent = getComponent("root");
const Loader  = getComponent("loader");
const NotFoundPage = getComponent("error/404");
const ErrorPage = getComponent("error/500");
const OfflinePage = getComponent("error/offline");

export const renderNotFoundPage = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  Route = DefaultRoute,
  api = clientApi,
  storage = clientStorage,
  history,
  store,
  context,
  routes,
  renderRoot = null
}, callback = () => null) => {
  
  let component = (
    <Provider store={store}>
      <ConnectedRouter
        Router={Router}
        context={context}
        history={history}
      >
        <RootComponent
          api={api}
          storage={storage}
          routes={routes}
        >
          <Switch>
            <Route component={NotFoundPage} />
          </Switch>
        </RootComponent>
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
  api = clientApi,
  storage = clientStorage,
  context,
  history,
  store,
  routes,
  renderRoot = null,
  error
}, callback = () => null) => {
  
  context = context || {};
  let component = (
    <HotAppContainer>
      <Provider store={store}>
        <ConnectedRouter
          Router={Router}
          context={context}
          history={history}
        >
          <RootComponent
            api={api}
            storage={storage}
            routes={routes}
          >
            <Switch>
              <ErrorPage error={error} />
            </Switch>
          </RootComponent>
        </ConnectedRouter>
      </Provider>
    </HotAppContainer>
  );
  
  if (!render) {
    return component;
  }
  // Render 500
  return render(component, renderRoot, callback);
};

export const renderOfflinePage = ({
  render = DefaultRender,
  Router = DefaultRouter,
  Switch = DefaultSwitch,
  api = clientApi,
  storage = clientStorage,
  context,
  history,
  store,
  routes,
  renderRoot = null,
  error
}, callback = () => null) => {
  
  context = context || {};
  let component = (
    <HotAppContainer>
      <Provider store={store}>
        <ConnectedRouter
          Router={Router}
          context={context}
          history={history}
        >
          <RootComponent
            api={api}
            storage={storage}
            routes={routes}
          >
            <Switch>
              <OfflinePage error={error} />
            </Switch>
          </RootComponent>
        </ConnectedRouter>
      </Provider>
    </HotAppContainer>
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
  const currentRoutes = url ? getRouteFromPath(url, routes): routes;
  
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
          <RootComponent
            api={api}
            storage={storage}
            routes={routes}
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
          </RootComponent>
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
  const { routes = [], api, storage, preLoadedData } = component.props;
  return _.map(routes, (route, i) => {
    return <RouteWithSubRoutes
      key={i}
      route={route}
      api={api}
      storage={storage}
      routes={routes}
      parentPreLoadedData={preLoadedData}
    />;
  });
};

/**
 * Return of array of promises that needs to be reloaded
 * @param routes
 * @param storage
 * @param api
 * @param store
 * @param url
 * @returns {Array}
 */
export const getPreloadDataPromises = (
  {
    routes,
    storage,
    api,
    store,
    url
  }
) => {
  let promises = [];
  _.each(routes, r => {
    
    // Load data and add it to route itself
    if (r.preLoadData) {
      promises.push((() => {
        
        // Pass route as reference so that we can modify it while loading data
        let returnData = r.preLoadData({route: r, match: r.match, storage, api, store, url});
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
