/**
 * Work with webpack to run for dev env
 */
/* eslint-disable */
import webpack from "webpack";
import clientConfig from "../webpack/prod.client.config.babel";
import serverConfig from "../webpack/prod.server.config.babel";

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