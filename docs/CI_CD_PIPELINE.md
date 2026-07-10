# CI/CD Pipeline Documentation

## Overview

This project uses a GitHub Actions CI/CD pipeline that automatically validates code quality on every push and pull request. No code is accepted without passing all quality gates.

---

## Triggers

| Event | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | `main`, `develop` |
| `workflow_dispatch` | Any (manual trigger) |

---

## Pipeline Jobs

### `quality` — Primary Quality Gate (Blocking)

Runs all 10 pipeline stages sequentially. **All other jobs depend on this passing.**

### `code-quality` — Static Analysis (Parallel)

Checks large files, debug statements, environment variable safety, and circular dependencies.

### `security` — Security Scanning (Parallel)

Scans production dependencies for vulnerabilities. Fails on CRITICAL severity.

### `performance` — Bundle Validation (After Quality)

Verifies code splitting, bundle sizes, lazy-loaded routes, and cache-busting hashes.

### `summary` — Status Report (Always)

Always runs last and reports the final status of all jobs.

---

## Pipeline Stages

### Stage 1 — Repository Checkout
Full history checkout (`fetch-depth: 0`) for accurate diffs.

### Stage 2 — Node.js Setup
Uses Node.js 22 LTS with npm dependency cache (keyed to `package-lock.json`).

### Stage 3 — Install Dependencies
`npm ci` — clean install from lockfile, fully reproducible.

### Stage 4 — TypeScript Validation
```bash
npx tsc --noEmit -p tsconfig.app.json
```
Fails immediately on any TypeScript error. The project uses strict mode with `noUnusedLocals` and `noUnusedParameters`.

### Stage 5 — ESLint / Lint
```bash
npx oxlint src/ --deny-warnings
```
Uses oxlint (the project's linter). `--deny-warnings` makes warnings fail the pipeline. Rules enforced:
- `react/rules-of-hooks`
- `react/only-export-components`

### Stage 6 — Unit Tests
```bash
npx vitest run
```
Runs the complete Vitest test suite (389 tests across 18 test files).

**Test coverage areas:**
- `src/tests/utils/` — RBAC functions, error utilities, logger
- `src/tests/services/` — gallery, auth, newsletter, settings, media services
- `src/tests/components/` — Button, Input, ErrorBoundary, ProtectedRoute
- `src/tests/hooks/` — useSafeAsync, useAuthorization
- `src/tests/security/` — RBAC enforcement, route protection, XSS prevention
- `src/tests/integration/` — End-to-end permission and service flows

### Stage 7 — Coverage Validation
```bash
npx vitest run --coverage
```
Enforces minimum coverage. **Pipeline fails below any threshold:**

| Metric | Threshold | Current |
|---|---|---|
| Statements | ≥ 85% | 92.52% |
| Branches | ≥ 80% | 85.23% |
| Functions | ≥ 85% | 95.31% |
| Lines | ≥ 85% | 93.44% |

Coverage reports are generated to `coverage/` (HTML, JSON, lcov).

### Stage 8 — Production Build
```bash
npm run build
```
Runs `tsc -b && vite build`. Fails on TypeScript errors or Vite warnings/errors. Produces optimized output in `dist/` with:
- Code splitting (vendor, supabase, i18n, auth, admin, route chunks)
- Tree shaking
- Asset content hashing for cache busting
- Chunk size warning at 600KB

### Stage 9 — Bundle Analysis
Analyzes bundle output:
- Lists all JS chunk sizes (gzipped)
- Warns if any chunk exceeds 600KB
- Verifies code splitting is producing multiple chunks
- Verifies cache-busting hashes exist

Results uploaded as `bundle-analysis` artifact.

### Stage 10 — Security Audit
```bash
npm audit --omit=dev --audit-level=critical
```
Scans **production dependencies only** for vulnerabilities. **Fails on CRITICAL severity.** Dev-dependency vulnerabilities are reported but non-blocking.

---

## Quality Gates

The pipeline **blocks merging** when any of these fail:

| Gate | Condition |
|---|---|
| TypeScript | Any type error |
| Lint | Any warning or error |
| Tests | Any test failure |
| Coverage | Any metric below threshold |
| Build | Any build error |
| Security | Critical vulnerability in production deps |

---

## Artifacts

All artifacts retained automatically:

| Artifact | Contents | Retention |
|---|---|---|
| `coverage-report` | HTML + JSON + lcov coverage | 30 days |
| `test-results` | Vitest JSON report | 30 days |
| `dist` | Production build output | 7 days |
| `bundle-analysis` | Bundle size summary + audit | 30 days |
| `security-report` | npm audit JSON | 30 days |

---

## Running Locally

Reproduce the full CI pipeline locally:

```bash
# Full CI validation
npm run ci:validate

# Individual steps
npm run type-check      # TypeScript check
npm run lint:ci         # Oxlint with no warnings
npm test                # Run tests
npm run test:coverage   # Tests + coverage report (check thresholds)
npm run build           # Production build
npm run audit:prod      # Security audit (production only)
```

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

---

## Environment Variables

Required secrets in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key |

These are only needed for the production build step. Tests mock Supabase entirely.

**Never commit `.env` with real values.** The `.env.example` shows required keys.

---

## Test Architecture

Tests are organized in `src/tests/`:

```
src/tests/
├── setup.ts                    # Test setup (jsdom, mocks)
├── utils/
│   ├── rbac.test.ts            # Pure RBAC function tests
│   ├── errors.test.ts          # Error utility tests
│   └── logger.test.ts          # Logger utility tests
├── services/
│   ├── auth.service.test.ts    # Authentication service
│   ├── gallery.service.test.ts # Gallery CRUD service
│   ├── media.service.test.ts   # Media pure functions + upload
│   ├── newsletter.service.test.ts # Newsletter service
│   ├── settings.service.test.ts   # Settings service
│   ├── services-additional.test.ts # Additional coverage
│   └── coverage-boost.test.ts     # Branch coverage tests
├── components/
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── ProtectedRoute.test.tsx
├── hooks/
│   ├── useSafeAsync.test.ts
│   └── useAuthorization.test.ts
├── security/
│   └── security.test.tsx       # RBAC, XSS, route protection
└── integration/
    └── flows.test.tsx           # End-to-end permission flows
```

**Key mocking patterns:**

```typescript
// Supabase query builder mock (thenable chain)
function makeChain(result) {
  const c = {}
  // Fluent methods return this
  ['select', 'insert', 'update', 'delete', 'eq', 'order', 'limit'].forEach(m => {
    c[m] = vi.fn(() => c)
  })
  c.single = vi.fn(() => Promise.resolve(result))
  // Makes the chain awaitable
  c.then = (resolve) => Promise.resolve(result).then(resolve)
  return c
}

// Auth context mock
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))
```

---

## Troubleshooting

### TypeScript fails
```bash
npm run type-check
# Fix all errors shown before pushing
```

### Lint fails
```bash
npx oxlint src/ --deny-warnings
# Check rule violations
```

### Tests fail
```bash
npm run test:watch     # Interactive mode
npx vitest --reporter=verbose  # Detailed output
```

### Coverage below threshold
```bash
npm run test:coverage
open coverage/index.html  # Identify uncovered lines
```

### Build fails
```bash
npm run build         # Check Vite output
npm run type-check    # Check TypeScript errors first
```

### Security audit fails
```bash
npm audit                    # Full vulnerability list
npm audit --omit=dev         # Production deps only
npm audit fix                # Auto-fix compatible updates
```

---

## Branch Strategy

| Branch | Purpose | CI |
|---|---|---|
| `main` | Production | Full pipeline on push + PR |
| `develop` | Integration | Full pipeline on push + PR |
| Feature branches | Development | Pipeline runs on PR targeting main/develop |

---

## Performance Targets

| Metric | Target |
|---|---|
| Pipeline duration | < 10 minutes |
| Total gzipped JS | < 500 KB |
| Test count | ≥ 380 |
| Statement coverage | ≥ 85% |
| Branch coverage | ≥ 80% |
