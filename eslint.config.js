// eslint.config.js (Flat config – Next.js 15 compatible)

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // ✅ Ignore files that should NEVER be linted
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",

      // 🔕 Disabled / parked files
      "src/middleware.off.js",
      "src/middleware.off.ts",

      // 🔕 Media & uploads (never lint)
      "public/uploads/**",
      "public/images/**",

      // 🔕 Copies / backups
      "**/*copy*",
      "**/*.bak",
    ],
  },

  // ✅ Base Next.js rules
  ...compat.extends("next/core-web-vitals"),

  // ✅ Custom rule overrides (production-safe)
  {
    rules: {
      /**
       * These rules are noisy but NOT build-breaking issues.
       * We downgrade them to warnings so builds succeed.
       */

      // Hooks warnings → warning, not error
      "react-hooks/exhaustive-deps": "warn",

      // Image optimization warnings → warning
      "@next/next/no-img-element": "warn",

      // App Router: this rule causes false positives
      "@next/next/no-html-link-for-pages": "off",

      // Allow console logs in server routes
      "no-console": "off",

      // Mixed JS/TS projects
      "@typescript-eslint/no-unused-vars": "warn",

      // Prevent parser crashes on legacy files
      "import/no-unresolved": "off",
    },
  },
];
