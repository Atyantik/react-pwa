import About from "../app/components/about";
import { updateRoutes } from "../client";

const routes = [
  {
    path: "/about",
    component: About,
    bundleKey: "about"
  }
];

updateRoutes(routes);

export default routes;