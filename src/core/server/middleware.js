const __development = process.env.NODE_ENV === "development";

let app = null;
let events = null;

// When not developing code, enabling it during development
// will take up un-necessary time and resources
if (__development) {
  // Hacky solution for webpack to not include the file
  // babel can import it as it will eval it and the file will be
  // still there.
  const devServer = eval("require")("./dev.server");
  app =  devServer.default;
  events = devServer.events;
} else {
  const prodServer = require("./prod.server");
  app = prodServer.default;
  events = prodServer.events;
}

export default app;
export { events };
