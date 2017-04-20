/**
 * Work with webpack to run for dev env
 */
import webpack from "webpack";
import webpackConfig from "../webpack/prod.config.babel";

const [clientConfig, serverConfig] = webpackConfig;

// Inform developers that Compilation is in process
// and wait till its fully done
// eslint-disable-next-line no-console
console.log("Compiling client javascript");

const clientCompiler = webpack(clientConfig);
const serverCompiler = webpack(serverConfig);

clientCompiler.run((err) => {
  if (!err) {
    serverCompiler.run((serverErr) => {
      if (!serverErr) {
        console.log("Compilation completed successfully.");
      }
    });
  }
});