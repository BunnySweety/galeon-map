# Contributing to Galeon Community Hospital Map

Merci de contribuer au projet Galeon Community Hospital Map! 🎉

## 📋 Table des Matières

- [Code of Conduct](#code-of-conduct)
- [Comment Contribuer](#comment-contribuer)
- [Style Guide](#style-guide)
- [Pull Request Process](#pull-request-process)
- [Tests](#tests)
- [Commit Messages](#commit-messages)

## Code of Conduct

Ce projet adhère à un code de conduite. En participant, vous acceptez de respecter ce code:

- ✅ Soyez respectueux et inclusif
- ✅ Acceptez les critiques constructives
- ✅ Focusez sur ce qui est meilleur pour la communauté
- ❌ Pas de harcèlement ou de comportement discriminatoire

## Comment Contribuer

### 🐛 Signaler un Bug

1. **Vérifiez** si le bug n'est pas déjà signalé dans les [Issues](https://github.com/galeon-community/hospital-map/issues)
2. **Créez une nouvelle issue** avec:
   - Titre clair et descriptif
   - Description détaillée du problème
   - Steps to reproduce
   - Comportement attendu vs actuel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version)

### ✨ Proposer une Fonctionnalité

1. **Ouvrez une issue** pour discuter de la fonctionnalité
2. **Attendez le feedback** avant de commencer le développement
3. **Forkez** le projet et créez une branche
4. **Implémentez** la fonctionnalité avec tests
5. **Soumettez** une Pull Request

### 🔧 Setup du Projet

```bash
# Fork & Clone
git clone https://github.com/your-username/hospital-map.git
cd hospital-map

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your tokens

# Start development server
npm run dev

# Run tests
npm test
npm run test:e2e
```

## Style Guide

### TypeScript

- ✅ **Utilisez TypeScript strict mode**
- ✅ **Typez explicitement** toutes les fonctions et variables
- ✅ **Évitez `any`** - utilisez `unknown` si nécessaire
- ✅ **Interfaces** pour les objets, **Types** pour les unions/intersections
- ✅ **Named exports** plutôt que default exports

```typescript
// ✅ Bon
export interface Hospital {
  id: string;
  name: string;
  location: [number, number];
}

export function getHospital(id: string): Hospital | null {
  // ...
}

// ❌ Mauvais
export default function getHospital(id: any) {
  // ...
}
```

### React Components

- ✅ **Functional components** avec hooks
- ✅ **Props interface** pour tous les composants
- ✅ **Memoization** pour les composants lourds (`memo`, `useMemo`, `useCallback`)
- ✅ **Error boundaries** pour les composants critiques
- ✅ **Accessibility** - ARIA labels, keyboard navigation

```typescript
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="btn"
    >
      {label}
    </button>
  );
}

// ❌ Mauvais
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### CSS / Tailwind

- ✅ **Tailwind utility classes** en priorité
- ✅ **CSS modules** pour les styles complexes
- ✅ **Responsive design** - mobile first
- ✅ **Dark mode ready** (si applicable)

### Code Quality

#### ESLint

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix
```

#### Prettier

```bash
# Formatter le code
npm run format
```

#### TypeScript

```bash
# Vérifier les types
npm run type-check
```

### Naming Conventions

- **Files**: `kebab-case.tsx` (ex: `hospital-detail.tsx`)
- **Components**: `PascalCase` (ex: `HospitalDetail`)
- **Functions**: `camelCase` (ex: `getHospitalById`)
- **Constants**: `UPPER_SNAKE_CASE` (ex: `MAX_HOSPITALS`)
- **Hooks**: `use` prefix (ex: `useHospitals`)
- **Utils**: `camelCase` (ex: `formatDate`)

## Pull Request Process

### 1. Créer une Branche

```bash
git checkout -b feature/awesome-feature
# or
git checkout -b fix/bug-description
```

### 2. Développer

- Écrivez du code propre et testé
- Suivez le style guide
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation

### 3. Tester

```bash
# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Tests accessibilité
npm run test:a11y

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

### 4. Commit

Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add hospital filtering by capacity"
# or
git commit -m "fix: resolve map rendering issue on mobile"
```

### 5. Push & Pull Request

```bash
git push origin feature/awesome-feature
```

Créez une Pull Request sur GitHub avec:

- **Titre clair** suivant Conventional Commits
- **Description détaillée** du changement
- **Screenshots** si applicable
- **Tests** passent tous (CI/CD)
- **Reviewers** assignés

### 6. Review Process

- Attendez l'approbation d'au moins 1 reviewer
- Répondez aux commentaires
- Effectuez les changements demandés
- Squash merge après approbation

## Tests

### Tests Unitaires (Vitest)

```typescript
// app/utils/__tests__/date-utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../date-utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('15/01/2025');
  });
});
```

### Tests E2E (Playwright)

```typescript
// e2e/hospitals.spec.ts
import { test, expect } from '@playwright/test';

test('should display hospital list', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="hospital-list"]')).toBeVisible();
});
```

### Tests Accessibilité (axe-core)

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Commit Messages

Format: `<type>(<scope>): <subject>`

### Types

- **feat**: Nouvelle fonctionnalité
- **fix**: Correction de bug
- **docs**: Documentation
- **style**: Formatting, missing semi-colons, etc.
- **refactor**: Refactoring de code
- **test**: Ajout de tests
- **chore**: Maintenance, dependencies, etc.
- **perf**: Amélioration de performance

### Exemples

```bash
feat(map): add hospital clustering for better performance
fix(timeline): resolve animation jank on mobile devices
docs(readme): update installation instructions
style(button): fix indentation and formatting
refactor(api): extract hospital data fetching logic
test(hooks): add tests for useGeolocation hook
chore(deps): update dependencies via Renovate
perf(bundle): reduce vendor chunk size by 30%
```

### Scope (optionnel)

- `map`: Carte Mapbox
- `timeline`: Animation chronologique
- `api`: API/données
- `ui`: Interface utilisateur
- `a11y`: Accessibilité
- `i18n`: Internationalisation
- `test`: Tests
- `build`: Configuration build
- `ci`: CI/CD

## Questions?

N'hésitez pas à:

- Ouvrir une [Discussion](https://github.com/galeon-community/hospital-map/discussions)
- Rejoindre notre [Discord](https://discord.gg/galeon) (si disponible)
- Contacter les mainteneurs

---

Merci de contribuer au projet Galeon Community Hospital Map! 🎉
