import express from "express";
import app from "./initializer";
import assets from "../config/assets";
import _ from "lodash";

app.use("/public", express.static("public"));

app.get("/", (req, res) => {

  let commonCss = _.filter(assets.commons, path => _.endsWith(path, ".css"));
  commonCss = _.map(commonCss, path => `<link rel="stylesheet" href="${path}" />`);
  commonCss = commonCss.join("");

  let appCss = _.filter(assets.app, path => _.endsWith(path, ".css"));
  appCss = _.map(appCss, path => `<link rel="stylesheet" href="${path}" />`);
  appCss = appCss.join("");

  let commonJs = _.filter(assets.commons, path => _.endsWith(path, ".js"));
  commonJs = _.map(commonJs, path => `<script type="text/javascript" src="${path}"></script>`);
  commonJs = commonJs.join("");

  let appJs = _.filter(assets.app, path => _.endsWith(path, ".js"));
  appJs = _.map(appJs, path => `<script type="text/javascript" src="${path}"></script>`);
  appJs = appJs.join("");


  res.send(`<!DOCTYPE html>
		<html>
		  <head>
		    <title>My App</title>
		    ${commonCss}
				${appCss}
		  </head>
		  <body>
		    <div id="app"></div>
		    ${commonJs}
		    ${appJs}
		  </body>
		</html>
	`);
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("App Started ==> Open http://localhost:3000 to see the app");
});