export default [
    {
      files: ['**/*.js', '**/*.jsx'], // Apply to JavaScript and JSX files
      languageOptions: {
        ecmaVersion: 2022, // Use the latest ECMAScript version
        sourceType: 'module', // Enable ES modules
        parserOptions: {
          ecmaFeatures: {
            jsx: true, // Enable JSX parsing for React
          },
        },
      },
      env: {
        browser: true, // Enable browser globals
        es2022: true, // Enable ES2022 globals
      },
      extends: ['eslint:recommended', 'plugin:react/recommended'], // Use recommended rules and React plugin
      plugins: ['react'], // Add React plugin
      rules: {
        'no-console': 'warn', // Warn on console.log
        'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }], // Error on unused vars
        'react/prop-types': 'off', // Optionally disable prop-types if using TypeScript or not needed
      },
    },
  ];