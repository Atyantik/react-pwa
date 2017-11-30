import Err404 from "react-pwa/src/components/error/404";
import Err500 from "react-pwa/src/components/error/500";
import Offline from "react-pwa/src/components/error/offline";
import Loader from "../app/components/loader";
import Fold from "react-pwa/src/components/fold";
import Root from "react-pwa/src/components/root";

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