# Contributing to Hospital Map

Thank you for considering contributing to Hospital Map! This document outlines the process and guidelines for contributing.

## Table of Contents
- [Contributing to Hospital Map](#contributing-to-hospital-map)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Process](#development-process)
  - [Pull Request Process](#pull-request-process)
  - [Code Style Guidelines](#code-style-guidelines)
    - [TypeScript Guidelines](#typescript-guidelines)
    - [React Guidelines](#react-guidelines)
    - [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project adheres to our Code of Conduct. Please read and follow it in all your interactions.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/hospital-map.git
   ```
3. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Process

1. Ensure your code follows our style guidelines
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commits:
   ```
   feat: add hospital status filter
   fix: correct map marker clustering
   docs: update API documentation
   ```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation in the docs folder
3. Include relevant test cases
4. Ensure CI checks pass
5. Request review from maintainers
6. Squash commits before merging

## Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Include JSDoc comments for public APIs
- Use named exports instead of default exports
- Keep components small and focused
- Practice clean code principles

### TypeScript Guidelines

```typescript
// Use interfaces for objects
interface Hospital {
  id: string;
  name: string;
  status: HospitalStatus;
}

// Use enums for fixed values
enum HospitalStatus {
  Deployed = 'Deployed',
  InProgress = 'InProgress',
  Signed = 'Signed'
}

// Use type for unions and complex types
type Coordinates = {
  lat: number;
  lon: number;
};

// Document complex functions
/**
 * Calculates distance between two coordinates
 * @param point1 - Starting coordinate
 * @param point2 - Ending coordinate
 * @returns Distance in kilometers
 */
function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  // Implementation
}
```

### React Guidelines

```tsx
// Use functional components with TypeScript
interface Props {
  hospital: Hospital;
  onStatusChange: (status: HospitalStatus) => void;
}

const HospitalCard: React.FC<Props> = ({ hospital, onStatusChange }) => {
  // Implementation
};

// Use hooks appropriately
const useHospital = (id: string) => {
  // Custom hook implementation
};
```

### Testing Guidelines

```typescript
describe('HospitalCard', () => {
  it('should render hospital information', () => {
    // Test implementation
  });

  it('should handle status changes', () => {
    // Test implementation
  });
});
```