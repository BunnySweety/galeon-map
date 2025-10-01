import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type * as Vitest from 'vitest';

declare global {
  const describe: typeof Vitest.describe;
  const it: typeof Vitest.it;
  const test: typeof Vitest.test;
  const expect: typeof Vitest.expect;
  const vi: typeof Vitest.vi;
  const beforeEach: typeof Vitest.beforeEach;
  const afterEach: typeof Vitest.afterEach;
  const beforeAll: typeof Vitest.beforeAll;
  const afterAll: typeof Vitest.afterAll;
}

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {}
}
