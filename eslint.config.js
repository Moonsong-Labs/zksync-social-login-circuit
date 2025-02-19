import * as eslintBaseConfig from "../../eslint.config.js";

export default [
  { ignores: ["**/node_modules", "**/dist", "**/temp", "**/tmp", "**/target"] },
  ...eslintBaseConfig.default,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
