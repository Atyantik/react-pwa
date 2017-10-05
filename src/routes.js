import { configureRoutes } from "./core/utils/bundler";

// routes
import * as Home from "./pages/home";
import * as About from "./pages/about";
import * as Contact from "./pages/contact";
import * as Blog from "./pages/blog";

export default configureRoutes([
  Home,
  About,
  Contact,
  Blog,
]);