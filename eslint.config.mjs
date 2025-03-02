import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    rules: {
      "no-console": "off",
      'no-implicit-any': 'off',
    },
  }).extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
