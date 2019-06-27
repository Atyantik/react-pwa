module.exports = {
  "extends": "./node_modules/@pawjs/pawjs/.eslintrc",
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": "./node_modules/@pawjs/pawjs/src/webpack/inc/webpack-resolver-config.js"
      }
    }
  },
  "rules": {
    "linebreak-style": ["error", process.platform === "win32" ? "windows" : "unix"]
  }
};
