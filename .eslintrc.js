const eslintConfig = require('@trafficbyintent/style-guide/typescript/eslint');

module.exports = {
  ...eslintConfig,
  parserOptions: {
    ...eslintConfig.parserOptions,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: eslintConfig.plugins.filter((p) => p !== 'jest'),
  ignorePatterns: [
    'dist/',
    'coverage/',
    '*.config.js',
    '.eslintrc.js',
    '.prettierrc.js',
    '**/*.test.ts',
  ],
  rules: {
    ...eslintConfig.rules,
    '@trafficbyintent/require-error-context': 'off',
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
    'import/no-duplicates': 'off',
    'import/order': 'off',
    'import/export': 'off',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
    '@typescript-eslint/only-throw-error': 'off',
  },
  overrides: [
    {
      files: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.integration.test.ts',
        '**/*.integration.gcp.test.ts',
        '**/__tests__/**',
        '**/tests/**',
      ],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@trafficbyintent/no-dynamic-test-data': 'error',
        'no-restricted-globals': [
          'error',
          {
            name: 'Date',
            message: 'Use static dates like new Date("2024-01-01T00:00:00Z") in tests',
          },
        ],
      },
    },
  ],
};
