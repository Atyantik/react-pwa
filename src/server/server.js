import express from "express";

import _ from "lodash";

import app from "./initializer";
import assets from "../config/assets";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Home from "../app/components/Home/home";

app.use("/public", express.static("public"));

const extractFiles = (assets, ext = ".js") => {
  let common = [];
  let dev = [];
  let other = [];

  const addToList = (file) => {

    let fileName = file.split("/").pop();

    if (_.startsWith(fileName, "common")) {
      common.push(file);
      return;
    }
    if (_.startsWith(fileName, "dev")) {
      dev.push(file);
      return;
    }
    other.push(file);
  };

  _.each(assets, asset => {
    "use strict";
    if (_.isArray(asset) || _.isObject(asset)) {
      _.each(asset, file => {
        if (_.endsWith(file, ext)) {
          addToList(file);
        }
      });
    } else {
      if (_.endsWith(asset, ext)) {
        addToList(asset);
      }
    }
  });

  return [
    ...common,
    ...dev,
    ...other,
  ];

};

app.get("/", (req, res) => {
  const html = ReactDOMServer.renderToString(<Home />);

  res.send(`<!DOCTYPE html>
		<html>
		  <head>
		    <title>My App</title>
        ${_.map(extractFiles(assets, ".css"), path => `<link rel="stylesheet" href="${path}" />`).join("")}
		  </head>
		  <body>
		    <div id="app">${html}</div>
		    ${_.map(extractFiles(assets, ".js"), path => `<script type="text/javascript" src="${path}"></script>`).join("")}
		  </body>
		</html>
	`);
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("App Started ==> Open http://localhost:3000 to see the app");
});