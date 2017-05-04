import React from "react";

export default (props) => {
  "use strict";
  const { location, staticContext } = props;
  if (staticContext) {
    staticContext.status = 404;
  }
  /**
   * @patch
   * When a page is loading and even common modules is not
   * loaded, then user tries to go back, it takes him to 404 page
   * As this is expected we simply ask user to check if
   * url is still loading and if so, go back
   * (as per history user will already on back page) and reload the url
   */
  if (typeof window !== "undefined") {
    if (window.__URL_LOADING__) {
      alert("Am here");
      window.location.reload(false);
      return null;
    }
  }
  return (
    <div className="container text-center mt-5">
      <h1 className="mt-5">404</h1>
      <p className="h3">Page not found</p>
      <p><small><i>{location.pathname}</i></small></p>
      <p>The page you are looking for doesn't exists. Go back.</p>
    </div>
  );
};