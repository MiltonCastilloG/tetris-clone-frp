import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['**/node_modules/**', '**/saved_games/**'],
  },
  js.configs.recommended,
  {
    files: ['server.js'],
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
      sourceType: 'script',
      globals: { ...globals.browser },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
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
