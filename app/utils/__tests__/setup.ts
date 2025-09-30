// File: app/utils/__tests__/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia (used by some components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock canvas context (used by Mapbox)
const mockCanvas = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Array(4),
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  getBoundingClientRect: vi.fn(() => ({
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
  })),
};

// Mock HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = mockCanvas.getContext;
global.HTMLCanvasElement.prototype.toDataURL = mockCanvas.toDataURL;
global.HTMLCanvasElement.prototype.getBoundingClientRect = mockCanvas.getBoundingClientRect;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Image constructor
global.Image = class {
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 100);
  }
  onload = null;
  onerror = null;
  src = '';
  width = 100;
  height = 100;
} as any;

// Suppress console errors in tests unless they're intentional
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Only show console.error in tests if it's not a React error boundary or known test error
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
      args[0].includes('Error:') ||
      args[0].includes('The above error occurred'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // Return a simple mock object instead of JSX in .ts file
    return {
      type: 'img',
      props: { src, alt, ...props }
    };
  },
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
  default: (_fn: () => Promise<any>) => {
    const Component = ({ children, ...props }: any) => {
      return {
        type: 'div',
        props: { ...props, children }
      };
    };
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

// Export common test utilities
export const createMockHospital = (overrides = {}) => ({
  id: '1',
  name: 'Test Hospital',
  nameEn: 'Test Hospital',
  nameFr: 'Hôpital Test',
  status: 'Deployed' as const,
  deploymentDate: '2023-06-15',
  website: 'https://test-hospital.com',
  coordinates: [2.3522, 48.8566] as [number, number],
  address: '123 Test St',
  imageUrl: '/images/test-hospital.png',
  ...overrides,
});

export const createMockMapRef = () => ({
  current: {
    getZoom: vi.fn(() => 10),
    flyTo: vi.fn(),
    getSource: vi.fn(() => ({
      setData: vi.fn(),
    })),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
    remove: vi.fn(),
    getContainer: vi.fn(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 500,
        height: 500,
      })),
      style: {},
    })),
    getCanvas: vi.fn(() => ({
      style: {},
    })),
  },
});

export { vi, cleanup };
