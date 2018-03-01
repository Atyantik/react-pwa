import {trackPageView} from "pawjs/src/utils/analytics";

import * as appReducers from "./app/reducers";

export const reduxInitialState = {
  counter: {
    count: 5
  }
};
export const reduxReducers = appReducers;
export const onPageChange = function() {
  trackPageView().catch();
};
// export const reduxEnahancers = [enhancer1, enhancer2];
// export const reduxMiddlewares = [middleware1, middleware2];

if (module.hot) module.hot.accept();