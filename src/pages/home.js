import Home from "app/components/home";
import DefaultLayout from "app/components/layout";
import { updateRoutes } from "../client";

const routes = [
  {
    path: "/",
    exact: true,
    component: Home,
    layout: DefaultLayout,
    bundleKey: "home",
  }
];

updateRoutes(routes);
export default routes;
