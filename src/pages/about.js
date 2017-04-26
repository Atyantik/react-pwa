import About from "../app/components/About/about";
import { loadRoutes } from "../client";

const routes = [
  {
    path: "/about",
    component: About,
    bundleKey: "about"
  }
];

loadRoutes(routes);

export default routes;