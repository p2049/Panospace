# Testing Guide for Panospace

This document provides comprehensive instructions for running all tests locally and in CI.

## Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- Git

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all
```

## Test Categories

### 1. Unit Tests (Jest + React Testing Library)

Unit tests cover individual components and functions.

**Run unit tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm run test:unit
```

**Watch mode:**
```bash
npm run test:watch
```

**Coverage threshold:** 80% for branches, functions, lines, and statements

### 2. Security Rules Tests

Tests for Firestore and Storage security rules using Firebase emulators.

**Setup:**
1. Ensure Firebase emulators are installed:
   ```bash
   firebase init emulators
   ```

2. Start emulators in a separate terminal:
   ```bash
   npm run emulators
   ```

3. Run security tests:
   ```bash
   npx jest tests/firestore.rules.test.js tests/storage.rules.test.js
   ```

**What's tested:**
- Firestore read/write permissions
- User authentication requirements
- Owner-only operations
- Storage upload/download rules
- Signed URL enforcement

### 3. E2E Tests (Playwright)

End-to-end tests simulate real user workflows.

**Setup:**
1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. Start Firebase emulators:
   ```bash
   npm run emulators
   ```

3. In another terminal, start the dev server:
   ```bash
   npm run dev
   ```

4. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

**Interactive mode:**
```bash
npm run test:e2e:ui
```

**Test scenarios:**
- User signup and login
- Post creation with images and text
- AI/nudity detection rejection
- Feed browsing and filtering
- Profile viewing
- Search functionality
- Signed URL retrieval
- Accessibility compliance
- Logout flow

### 4. Linting

**Run ESLint:**
```bash
npm run lint
```

**Auto-fix issues:**
```bash
npm run lint:fix
```

### 5. Code Formatting

**Format code with Prettier:**
```bash
npm run format
```

## Firebase Emulators

The project uses Firebase emulators for local testing.

**Start all emulators:**
```bash
npm run emulators
```

**Emulator ports:**
- Auth: 9099
- Firestore: 8080
- Storage: 9199
- Functions: 5001
- Emulator UI: 4000

**Access Emulator UI:**
Open http://localhost:4000 in your browser

## Test Fixtures

Test images are located in `e2e/fixtures/`:
- `test-image-normal.jpg`: Standard landscape photo
- `test-image-ai.jpg`: AI-generated image (for rejection testing)
- `test-image-nudity.jpg`: Placeholder for content moderation testing

## CI/CD Pipeline

The GitHub Actions workflow runs automatically on:
- Push to `main` or `qa/full-test-pass` branches
- Pull requests to `main`

**Pipeline stages:**
1. **Lint**: ESLint checks
2. **Unit Tests**: Jest with coverage reporting
3. **Security Rules Tests**: Firestore and Storage rules validation
4. **E2E Tests**: Playwright tests with emulators
5. **Build**: Production build with bundle size check
6. **Security Audit**: npm audit for vulnerabilities
7. **Deploy Preview**: Firebase Hosting preview (PRs only)

## Coverage Reports

Coverage reports are generated in the `coverage/` directory.

**View HTML report:**
```bash
npm run test:unit
open coverage/lcov-report/index.html
```

**Coverage requirements:**
- Branches: ≥80%
- Functions: ≥80%
- Lines: ≥80%
- Statements: ≥80%

## Troubleshooting

### Emulators won't start
```bash
# Kill existing emulator processes
pkill -f firebase

# Clear emulator data
rm -rf .firebase/
```

### Tests fail with "Cannot find module"
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Playwright tests timeout
```bash
# Increase timeout in playwright.config.js
# Ensure dev server is running on correct port
# Check that emulators are started
```

### Coverage below threshold
```bash
# Identify uncovered files
npm run test:unit -- --coverage --verbose

# Add tests for uncovered components
```

## Best Practices

1. **Write tests first**: Follow TDD when adding new features
2. **Mock external dependencies**: Use Jest mocks for Firebase, APIs
3. **Use data-testid**: Add `data-testid` attributes for reliable selectors
4. **Test user behavior**: Focus on what users do, not implementation
5. **Keep tests isolated**: Each test should be independent
6. **Use proper waits**: Avoid `setTimeout`, use `waitFor` instead
7. **Test accessibility**: Include a11y checks in component tests

## Continuous Improvement

- Review coverage reports regularly
- Update tests when refactoring
- Add E2E tests for critical user flows
- Monitor CI pipeline performance
- Keep dependencies updated

## Support

For issues or questions:
1. Check existing test files for examples
2. Review Jest and Playwright documentation
3. Check CI logs for detailed error messages
4. Ensure emulators are running for integration tests

## Quick Reference

```bash
# Full test suite
npm run test:all

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e

# Lint
npm run lint

# Format
npm run format

# Start emulators
npm run emulators

# Dev server
npm run dev

# Production build
npm run build
```
