import express from "express";
import app from "./initializer";
import assets from "../config/assets";
import _ from "lodash";

app.use("/public", express.static("public"));

app.get("/", (req, res) => {

  res.send(`<!DOCTYPE html>
		<html>
		  <head>
		    <title>My App</title>
				${_.chain(assets.app).filter(path => _.endsWith(path, ".css")).map(path => `<link rel="stylesheet" href="${path}" />`).value().join("")}
				${_.chain(assets.commons).filter(path => _.endsWith(path, ".css")).map(path => `<link rel="stylesheet" href="${path}" />`).value().join("")}
		  </head>
		  <body>
		    <div id="app"></div>
		    ${_.chain(assets.commons).filter(path => _.endsWith(path, ".js")).map(path => `<script type="text/javascript" src="${path}"></script>`).value().join("")}
		    ${_.chain(assets.app).filter(path => _.endsWith(path, ".js")).map(path => `<script type="text/javascript" src="${path}"></script>`).value().join("")}
		  </body>
		</html>
	`);
});

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log("App Started ==> Open http://localhost:3000 to see the app");
});