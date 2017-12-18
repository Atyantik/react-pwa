import Err404 from "pawjs/src/components/error/404";
import Err500 from "pawjs/src/components/error/500";
import Offline from "pawjs/src/components/error/offline";
import Loader from "../app/components/loader";
import Fold from "pawjs/src/components/fold";
import Root from "pawjs/src/components/root";

/**
 * Specify Mapping of components respective to
 * src folder
 * @type Object
 */
export default {
  "error/404": Err404,
  "error/500": Err500,
  "error/offline": Offline,
  "loader": Loader,
  "fold": Fold,
  "root": Root
};