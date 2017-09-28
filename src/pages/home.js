import Home from "../app/components/home";
import DefaultLayout from "../app/components/layout";

const routes = [
  {
    path: "/",
    exact: true,
    component: Home,
    layout: DefaultLayout,
    bundleKey: "home",
  }
];
if (typeof window !== "undefined") {
  window.__updatePage && window.__updatePage({ routes });
  window.__renderRoutes && window.__renderRoutes();
}

export default routes;
