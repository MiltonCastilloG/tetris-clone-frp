import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/saved_games/**'],
  },
  js.configs.recommended,
  {
    files: ['server.js', 'dev_utils/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
  },
  {
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  eslintConfigPrettier,
];
