module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  overrides: [],
  // parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      modules: true,
      jsx: true,
    },
    requireConfigFile: false,
    parser: "@babel/eslint-parser",
  },
  plugins: ["react"],
  rules: {
    semi: ["error", "always"],
    "no-var": 2, // 要求使用 let 或 const 而不是 var
    "react/react-in-jsx-scope": "off", // React17后不需要在jsx中主动引入react
    "no-console": "warn",
  },
};
