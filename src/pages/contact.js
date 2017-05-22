import Contact from "../app/components/contact";

const routes = [
  {
    path: "/contact",
    component: Contact,
    layout: false,
    bundleKey: "contact",
  }
];

if (typeof window !== "undefined") {
  window.__updateRoutes(routes);
}

export default routes;