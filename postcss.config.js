module.exports = {
  plugins: [
    require("postcss-smart-import")({ /* ...options */ }),
    require("postcss-cssnext")({ /* ...options */ }),
    require("precss")({ /* ...options */ })
  ]
};
