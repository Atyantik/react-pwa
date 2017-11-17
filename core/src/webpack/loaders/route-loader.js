const path = require("path");
module.exports = function(source) {
  
  const bundleKey = path.basename(this.resourcePath, path.extname(this.resourcePath));
  
  let routesKeyword = "routes";
  const match = source.match(/exports.default[ \t]*=[ \t]*(\w+).*/);
  if (match.length && match.length >=2 ) {
    routesKeyword = match[1];
  }
  
  let extendedSource = `
  exports.bundleKey = ${JSON.stringify(bundleKey)};
  `;
  
  if (process.env.NODE_ENV !== "development") {
    extendedSource += `
    if (typeof window !== "undefined") {
      window.__updatePage && window.__updatePage({ routes: ${routesKeyword}, bundleKey: ${JSON.stringify(bundleKey)} });
      window.__renderRoutes && window.__renderRoutes();
    }`;
  }
  
  return `${source}
  ${extendedSource}`;
};