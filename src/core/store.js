import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { routerReducer, routerMiddleware } from "react-router-redux";
import {  } from "react-router-redux";

const createReducer = (reducers = {}) => {
  return combineReducers({
    ...reducers,
    routing: routerReducer
  });
};

let composeEnhancers = compose;
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
}

export default function configureStore({
  initialState = {},
  history,
  middleware = []
}) {
  // Add history middleware
  const historyMiddleware = routerMiddleware(history);
  middleware.push(historyMiddleware);

  const store = createStore(createReducer(), initialState, composeEnhancers(applyMiddleware(...middleware)));
  store.asyncReducers = {};

  return store;
}

export function injectAsyncReducer(store, name, asyncReducer) {
  store.asyncReducers[name] = asyncReducer;
  store.replaceReducer(createReducer(store.asyncReducers));
}