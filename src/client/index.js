import React from "react";
import ReactDOM from "react-dom";
import Home from "../app/components/Home/home.js";
const AppDom = document.getElementById("app");

ReactDOM.render(<Home />, AppDom);

if (module.hot) {
  module.hot.accept();
}