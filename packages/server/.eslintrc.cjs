/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: ["@repo/eslint-config/server.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  }
};
module.exports = config;
