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
  window.__updatePage && window.__updatePage({ routes });
  window.__renderRoutes && window.__renderRoutes();
}

export default routes;