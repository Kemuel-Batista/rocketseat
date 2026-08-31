// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
    ignores: [
      'node_modules',
      'dist',
      'build',
      'coverage',
      'bun.lock',
      'package-lock.json',
      'yarn.lock',
    ],
  },
]);
