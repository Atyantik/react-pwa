import Contact from "../app/components/contact";
import { updateRoutes } from "../client";

const routes = [
  {
    path: "/contact",
    component: Contact,
    bundleKey: "contact",
  }
];
updateRoutes(routes);

export default routes;