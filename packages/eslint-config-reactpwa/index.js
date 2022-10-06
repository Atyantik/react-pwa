const config = {
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
    "airbnb-base",
    "airbnb-typescript/base",
  ],
  "plugins": [
    "@typescript-eslint",
    "jest",
    "import",
  ],
  "parserOptions": {
    "ecmaFeatures": { "jsx": true },
    "sourceType": "module",
    "ecmaVersion": 12,
  },
  "env": {
    "browser": true, // Enables browser globals like window and document
    "amd": true, // Enables require() and define() as global variables as per the amd spec.
    "node": true, // Enables Node.js global variables and Node.js scoping.
    "jest/globals": true,
    "es2021": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-use-before-define": [
      "error",
      {
        "classes": true,
        "functions": false,
        "typedefs": true,
        "variables": true
      }
    ],
    "import/no-default-export": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "no-prototype-builtins": "off",
    "no-use-before-define": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/prevent-abbreviations": "off",
  },
  "settings": {
    "import/core-modules": [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      "express"
    ],
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
        ]
      }
    },
  },
  "ignorePatterns": [
    "scaffold/**/*.(ts|js|tsx|jsx)"
  ]
};

module.exports = config;
