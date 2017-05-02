import Home from "../app/components/home";
import { updateRoutes } from "../client";

const routes = [
  {
    path: "/",
    exact: true,
    component: Home,
    bundleKey: "home",
  }
];

updateRoutes(routes);
export default routes;