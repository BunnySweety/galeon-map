module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: './tsconfig.json'
    },
    plugins: [
      'react',
      'react-hooks',
      '@typescript-eslint',
      'jsx-a11y',
      'import',
      'prettier'
    ],
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/display-name': 'off',
  
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
  
      // TypeScript
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
  
      // Import
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-cycle': 'error',
  
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-nested-ternary': 'error',
      'no-template-curly-in-string': 'error',
  
      // Accessibility
      'jsx-a11y/anchor-is-valid': ['error', {
        'components': ['Link'],
        'specialLink': ['hrefLeft', 'hrefRight'],
        'aspects': ['invalidHref', 'preferButton']
      }]
    },
    overrides: [
      {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
          'no-undef': 'off'
        }
      },
      {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        env: {
          jest: true
        },
        rules: {
          '@typescript-eslint/no-explicit-any': 'off'
        }
      }
    ]
  };