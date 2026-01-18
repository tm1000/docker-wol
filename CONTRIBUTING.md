# Contributing to Wake-on-LAN API Container

Thank you for your interest in contributing! This document provides guidelines for development, testing, and submitting contributions.

## Development Setup

### Prerequisites

- Node.js 24 LTS or later
- npm 10+ or yarn
- Git
- Docker (optional, for testing containerization)
- A network device with Wake-on-LAN enabled (for manual testing)

### Initial Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/docker-wol.git
cd docker-wol

# Install dependencies
npm install

# Set up environment variables for testing
export API_KEY=test-api-key-12345

# Run tests to verify setup
npm test
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

Follow the project structure:
- **Routes**: Add endpoints in `src/routes/`
- **Services**: Business logic in `src/services/`
- **Validators**: Input validation in `src/validators/`
- **Middleware**: Request processing in `src/middleware/`
- **Types**: TypeScript interfaces in `src/types/`

### 3. Write Tests (Test-First Development)

**Required**: Write tests before implementation.

```bash
# Unit tests
tests/unit/your-feature.test.ts

# Integration tests
tests/integration/your-feature.test.ts

# Contract tests (if changing API)
tests/contract/openapi.test.ts
```

**Example unit test:**
```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../../src/your-module.js';

describe('Your Feature', () => {
  it('should do something', () => {
    expect(yourFunction('input')).toBe('expected-output');
  });
});
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/unit/your-feature.test.ts

# Run with coverage
npm run test:coverage

# Watch mode during development
npm test -- --watch
```

### 5. Code Quality Checks

```bash
# Lint TypeScript
npm run lint

# Format code
npm run format

# Type check
npm run build
```

### 6. Manual Testing

```bash
# Start development server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/wake \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-12345" \
  -d '{"mac": "AA:BB:CC:DD:EE:FF"}'
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript mode (already configured)
- Define interfaces in `src/types/index.ts`
- Use `async/await` for asynchronous code
- Avoid `any` types (use `unknown` if necessary)
- Export only what's needed

### Naming Conventions

- **Files**: kebab-case (`wake-service.ts`)
- **Variables/Functions**: camelCase (`sendWakePacket`)
- **Types/Interfaces**: PascalCase (`WakeRequest`)
- **Constants**: UPPER_SNAKE_CASE (`API_KEY`)

### Code Organization

```typescript
// 1. Imports
import type { FastifyInstance } from 'fastify';
import { someFunction } from './utils.js';

// 2. Type definitions
interface MyType {
  field: string;
}

// 3. Constants
const DEFAULT_PORT = 9;

// 4. Functions
export function myFunction(): void {
  // Implementation
}
```

### Comments

- Document complex logic
- Add JSDoc for public APIs
- Keep comments concise and up-to-date

```typescript
/**
 * Send Wake-on-LAN magic packet
 * @param request - Wake request with MAC address and options
 * @returns Promise that resolves when packet is sent
 */
export async function sendWakePacket(request: WakeRequest): Promise<void> {
  // Implementation
}
```

## Testing Requirements

### Coverage

- Minimum 80% code coverage for new code
- All new features must have tests
- Bug fixes must include regression tests

### Test Types

1. **Unit Tests**: Test individual functions and modules
2. **Integration Tests**: Test HTTP endpoints end-to-end
3. **Contract Tests**: Verify OpenAPI specification compliance

### Test Conventions

```typescript
describe('Module Name', () => {
  describe('Specific Function', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`npm test`)
- [ ] Code lints without errors (`npm run lint`)
- [ ] Code builds successfully (`npm run build`)
- [ ] Coverage meets 80% threshold
- [ ] Manual testing completed
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if applicable)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add custom timeout option for WoL packets
fix: correct MAC address validation for edge case
docs: update API examples in README
test: add integration tests for custom port
refactor: simplify error handling logic
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or documented if unavoidable)
```

## Architecture Guidelines

### Single Responsibility

Each module should have one clear purpose:
- Routes: Handle HTTP requests/responses
- Services: Business logic
- Validators: Input validation
- Middleware: Request processing

### Error Handling

```typescript
// Always use specific error codes
const errorResponse: ErrorResponse = {
  status: 'error',
  message: 'Human-readable message',
  mac: requestedMac,
  timestamp: new Date().toISOString(),
  error: {
    code: 'SPECIFIC_ERROR_CODE',
    details: 'Technical details for debugging',
  },
};
```

### Logging

```typescript
// Use structured logging with Pino
server.log.info(
  {
    mac,
    address,
    port,
    result: 'success',
  },
  'Wake-on-LAN packet sent successfully'
);
```

## Documentation

### Code Documentation

- Update inline comments for complex logic
- Add JSDoc for public APIs
- Keep README.md examples up-to-date

### API Documentation

- Update OpenAPI spec (`specs/001-wol-api-docker/contracts/openapi.yaml`)
- Add examples for new endpoints or parameters
- Document error codes in data model

## Release Process

Releases are automated via GitHub Actions:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions builds and publishes Docker images

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue with reproduction steps
- **Features**: Open a GitHub Issue with use case description
- **Security**: Email security@your-domain.com (do not open public issue)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Welcome newcomers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
