import React from "react";

export default (params) => {
  "use strict";
  const { location, staticContext } = params;
  if (staticContext) {
    staticContext.status = 404;
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