// eslint.config.js

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",

      // 🚫 Disabled middleware
      "src/middleware.off.js",
      "src/middleware.off.ts",

      // 🚫 COPY FILES (this is CRITICAL)
      "**/* - Copy/**",
      "**/*copy*/**",
      "**/*.bak",

      // 🚫 uploads & media
      "public/uploads/**",
      "public/images/**",
    ],
  },

  ...compat.extends("next/core-web-vitals"),

  {
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "off",
      "no-console": "off",
      "import/no-unresolved": "off",
    },
  },
];
