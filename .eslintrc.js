const { getESLintConfig } = require('@trafficbyintent/linters/typescript');

module.exports = {
  ...getESLintConfig({
    allowConsoleError: true,
    allowConsoleWarn: true,
  }),
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: [
    'dist/',
    'coverage/',
    'node_modules/',
    '*.config.js',
    '*.config.mjs',
    '.eslintrc.js',
    '.prettierrc.js',
    '**/*.test.ts',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    'multiline-comment-style': ['error', 'starred-block'],
  },
};
