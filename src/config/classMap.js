import Err404 from "../core/components/error/404";
import Err500 from "../core/components/error/500";
import Offline from "../core/components/error/offline";
import Loader from "../app/components/loader";
import Fold from "../core/components/fold";
import Root from "../core/components/root";

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