import Contact from "../app/components/contact";

const routes = [
  {
    path: "/contact",
    component: Contact,
    layout: false,
    exact: true,
    bundleKey: "contact",
  }
];

if (typeof window !== "undefined") {
  window.__updateRoutes(routes);
  if (module.hot) {
    module.hot.accept();
    window.__renderRoutes();
  }
}

export default routes;