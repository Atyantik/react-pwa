module.exports = function(source) {
  
  let routesKeyword = "routes";
  const match = source.match(/exports.default[ \t]*=[ \t]*(\w+).*/);
  if (match.length && match.length >=2 ) {
    routesKeyword = match[1];
  }
  
  return `${source}
  if (typeof window !== "undefined") {
    window.__updatePage && window.__updatePage({ routes: ${routesKeyword} });
    window.__renderRoutes && window.__renderRoutes();
  }`;
};