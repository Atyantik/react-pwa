const __development = process.env.NODE_ENV === "development";

let app = null;
// When not developing code, enabling it during development
// will take up un-necessary time and resources

if (__development) {
  // Hacky solution for webpack to not include the file
  // babel can import it as it will eval it and the file will be
  // still there.
  // app =  eval("require")("./dev.server").default;
  app =  eval("require")("./dev.server").default;
} else {
  app = require("./prod.server").default;
}

export default app;
