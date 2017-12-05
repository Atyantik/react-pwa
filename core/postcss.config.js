module.exports = {
  plugins: [
    require("postcss-import")({ /* ...options */ }),
    require("postcss-cssnext")({ /* ...options */ }),
    require("precss")({ /* ...options */ })
  ]
};
