import Counter from "../app/components/counter";
import DefaultLayout from "../app/components/layout";

const routes = [
  {
    path: "/counter",
    exact: true,
    component: Counter,
    layout: DefaultLayout,
  }
];
export default routes;