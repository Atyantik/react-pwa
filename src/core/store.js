import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { routerReducer, routerMiddleware } from "react-router-redux";
import * as coreReducers from "./reducers";

const createReducer = (reducers = {}) => {
  return combineReducers({
    ...reducers,
    ...coreReducers,
    router: routerReducer
  });
};

let composeEnhancers = compose;
if (typeof window !== "undefined") {
  composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] || compose;
}

export default function configureStore({
  initialState = {},
  history,
  middleware = [],
  reducers = {}
}) {
  // Add history middleware
  const historyMiddleware = routerMiddleware(history);
  middleware.push(historyMiddleware);
  
  const store = createStore(createReducer(reducers), initialState, composeEnhancers(applyMiddleware(...middleware)));
  store.asyncReducers = reducers;
  return store;
}

export function injectAsyncReducers(store, asyncReducers) {
  store.asyncReducers = {
    ...store.asyncReducers,
    ...asyncReducers,
  };
  store.replaceReducer(createReducer(store.asyncReducers));
}
