import {trackPageView} from "react-pwa/src/utils/analytics";

export const reduxInitialState = {};
export const reduxReducers = null;
export const onPageChange = function() {
  trackPageView().catch();
};

if (module.hot) module.hot.accept();