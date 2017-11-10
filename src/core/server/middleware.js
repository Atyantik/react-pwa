import _ from "lodash";
import config from "../../config";

const __development = process.env.NODE_ENV === "development";

let app = null;

// When not developing code, enabling it during development
// will take up un-necessary time and resources
if (__development) {
  // Hacky solution for webpack to not include the file
  // babel can import it as it will eval it and the file will be
  // still there.
  const devServer = eval("require")("./dev.server");
  app =  devServer.default;
} else {
  const prodServer = require("./prod.server");
  app = prodServer.default;
}

// Add csp headers
const cspHeaders = _.filter(_.get(config, "seo.meta", []), meta => {
  return  "content-security-policy" === _.get(meta, "httpEquiv", "").toLowerCase();
});
app.use((req, res, next) => {
  _.each(cspHeaders, cspHead => {
    cspHead.content && res.header("Content-Security-Policy", cspHead.content);
  });
  next();
});



export default app;
