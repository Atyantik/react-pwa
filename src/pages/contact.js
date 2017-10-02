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

export default routes;