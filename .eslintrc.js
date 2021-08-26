const path = require('path');
console.log(process.platform);
module.exports = {
  extends: './node_modules/@pawjs/pawjs/.eslintrc',
  rules: {
    'import/no-extraneous-dependencies': 0,
    'react/jsx-boolean-value': 0,
    'import/extensions': 0,
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  },

  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, 'webpack.resolver.js'),
      },
    },
  },
};
