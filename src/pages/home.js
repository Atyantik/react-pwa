import Home from "../app/components/Home/home";
import { loadRoutes } from "../client";

const routes = [
  {
    path: "/",
    exact: true,
    component: Home,
    bundleKey: "home",
  }
];
loadRoutes(routes);

export default routes;