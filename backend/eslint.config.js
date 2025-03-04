export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    env: {
      node: true, // Enable Node.js globals
      es2022: true,
    },
    extends: 'eslint:recommended',
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
    },
  },
];