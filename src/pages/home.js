import Home from "../app/components/Home/home";
import { updateRoutes } from "../client";

const routes = [
  {
    path: "/",
    something: "test",
    exact: true,
    component: Home,
    bundleKey: "home",
  }
];
updateRoutes(routes);

export default routes;