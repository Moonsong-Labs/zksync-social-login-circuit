import * as eslintBaseConfig from "../../eslint.config.js";

export default [
  { ignores: ["**/node_modules", "**/dist", "**/temp", "**/tmp", "**/target"] },
  ...eslintBaseConfig.default,
];
