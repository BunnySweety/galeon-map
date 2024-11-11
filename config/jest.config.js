module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/config/jest.setup.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/config/__mocks__/fileMock.js'
    },
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.json'
      }]
    },
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/.next/'
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/index.{js,ts}',
      '!src/main.tsx',
      '!src/vite-env.d.ts'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: 'coverage/junit',
          outputName: 'junit.xml',
          classNameTemplate: '{filepath}',
          titleTemplate: '{title}'
        }
      ]
    ],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
        isolatedModules: true
      }
    },
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ]
  };