# E2E Test Suite Design — p5.js Web Editor

**Date:** 2026-02-28  
**Author:** Mentee (LFX Mentorship proposal)  
**Mentor:** Claire Peng  
**Project size:** 175H Medium

---

## 1. Problem Statement

The p5.js Web Editor is undergoing active refactor work — a TypeScript migration and future self-hosting support. The current test suite consists of:

- Jest unit tests for server models, controllers, and client utilities
- A single integration test (`client/index.integration.test.jsx`) that only verifies the editor _renders_, not that it _works_

This means **silent regressions are possible on every PR**. If a refactor breaks the save flow, the run-preview flow, or authentication, no automated test will catch it. This design introduces an end-to-end (e2e) test suite using Playwright to cover the key user flows that matter most.

---

## 2. Goals

1. **Automated e2e gate on every PR** — a new GitHub Actions workflow named `e2e` triggers on all pull requests into the `development` branch
2. **Real full-stack coverage** — tests run against an actual server + test database (MongoDB), not mocks
3. **Accessibility built-in** — every user-flow test also runs an axe-core WCAG 2.2 scan
4. **Runnable locally** — any contributor can run the full suite with one command using Docker Compose
5. **Open backlog for contributors** — unimplemented flows are documented in `CONTRIBUTING.md` as clearly scoped issues

---

## 3. Non-Goals

- OAuth login testing (GitHub/Google) — requires external OAuth provider; deferred to backlog
- Visual regression testing — out of scope for this iteration
- Mobile/cross-browser coverage in CI — Chromium only for speed; Firefox/WebKit optional locally
- Performance testing — out of scope

---

## 4. Tech Stack Decision

| Concern | Choice | Rationale |
| --- | --- | --- |
| E2E framework | **Playwright** | TypeScript-native, fast, excellent GitHub Actions support, used by sister project p5.js-website (PR #933) |
| Accessibility | **@axe-core/playwright** | axe-core already adopted in the p5.js ecosystem; WCAG 2.2 coverage |
| Test DB | **MongoDB via Docker Compose** | Matches production stack exactly; existing docker-compose-development.yml is a direct model |
| Seed strategy | **Playwright globalSetup via app API** | No direct DB coupling; tests against the same API users hit |
| CI | **GitHub Actions** | Already used for `test.yml` and deploy workflows |

---

## 5. Architecture

### 5.1 Directory Layout

```
e2e/                                     ← new top-level directory
├── playwright.config.ts                 ← Playwright configuration
├── global-setup.ts                      ← Seeds test users/projects before suite
├── global-teardown.ts                   ← Cleans up seeded data after suite
├── fixtures/
│   └── index.ts                         ← Unified fixtures (auth + page objects + testData)
├── pages/
│   ├── base.page.ts                     ← Shared helpers (force click, cookie consent)
│   ├── editor.page.ts                   ← Editor interactions (run/save/share/download)
│   ├── nav.page.ts                      ← Navigation and account menu interactions
│   ├── dashboard.page.ts                ← My Sketches and sketch-card actions
│   ├── login.page.ts                    ← Login form interactions
│   ├── signup.page.ts                   ← Signup form interactions
│   ├── fullscreen.page.ts               ← Fullscreen route interactions
│   └── modal.page.ts                    ← Overlay/modal helpers
├── tests/
│   ├── unauthenticated/
│   │   ├── run-sketch.spec.ts
│   │   ├── save-prompt.spec.ts
│   │   ├── download-sketch.spec.ts
│   │   ├── fullscreen-preview.spec.ts
│   │   ├── signup-flow.spec.ts
│   │   └── auth-redirects.spec.ts
│   ├── authenticated/
│   │   ├── run-sketch.spec.ts
│   │   ├── save-sketch.spec.ts
│   │   ├── edit-and-save.spec.ts
│   │   ├── logout.spec.ts
│   │   ├── login-flow.spec.ts
│   │   ├── my-sketches.spec.ts
│   │   ├── duplicate-sketch.spec.ts
│   │   ├── share-modal.spec.ts
│   │   └── console-output.spec.ts
│   └── a11y/
│       ├── editor.spec.ts
│       ├── login.spec.ts
│       ├── signup.spec.ts
│       └── dashboard.spec.ts
└── utils/
    ├── api-helpers.ts                   ← Shared helpers (login/create/delete project)
    └── constants.ts                     ← Shared constants (BASE_URL, PREVIEW_URL, etc.)
```

### 5.2 New package.json Scripts

```json
"test:e2e":           "playwright test",
"test:e2e:ui":        "playwright test --ui",
"test:e2e:headed":    "playwright test --headed",
"test:e2e:report":    "playwright show-report"
```

### 5.3 New devDependencies

```json
"@playwright/test":       "^1.x",
"@axe-core/playwright":   "^4.x"
```

---

## 6. Test Environment

### 6.1 docker-compose.e2e.yml

A new Docker Compose file dedicated to e2e testing:

```yaml
services:
  mongo-e2e:
    image: mongo:8.0
    # No persistent volume — fresh database every run

  app:
    build:
      context: ./
      dockerfile: Dockerfile
      target: development
    environment:
      - MONGO_URL=mongodb://mongo-e2e:27017/p5js-e2e-test
      - NODE_ENV=development
      - E2E=true
      - API_URL=/editor
      - SESSION_SECRET=e2e-test-secret-not-for-production
      - PORT=8000
      - PREVIEW_PORT=8002
    ports:
      - '8000:8000'
      - '8002:8002'
    depends_on:
      - mongo-e2e
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8000/']
      interval: 5s
      timeout: 3s
      retries: 10
```

**Key design decisions:**

- No named volume → ephemeral DB, clean state every run
- Historical proposal used `NODE_ENV=test`; shipped config uses `NODE_ENV=development` + `E2E=true` so the app boots with the same runtime behavior as local development while still enabling e2e-specific setup.
- API base path is `/editor`, so setup/teardown calls target `/editor/login` and `/editor/projects`.
- Healthcheck → `docker compose up --wait` blocks until app is ready before Playwright starts

### 6.2 Playwright Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
    // Firefox and WebKit available locally; CI runs Chromium only
  ]
});
```

**CI-specific settings:**

- `retries: 2` — reduces flake noise on CI
- `workers: 1` — avoids port conflicts in single-container CI
- HTML report + screenshots on failure → uploaded as GitHub Actions artifact

---

## 7. Data Seeding Strategy

### 7.1 global-setup.ts flow

```
1. Wait for app healthy (poll GET http://localhost:8000 until 200/30x)
2. Insert the e2e test user directly in MongoDB with a hashed password
3. POST /editor/login as the seeded user → get session cookie
4. POST /editor/projects → create seeded sketch/project data for test flows
5. Write { authEmail, authPassword, authUsername, seededProjectId, cookie } to e2e/.test-data.json
   (gitignored)

Historical note: early proposal drafts referenced `/api/v1/*` routes and signup-based seeding, but the implemented suite uses `/editor/*` API routes and direct DB seeding for reliability.
```

### 7.2 global-teardown.ts flow

```
1. DELETE /editor/projects/:seededProjectId (authenticated)
2. Remove test user directly from MongoDB (no delete-account API endpoint in this flow)
3. Remove e2e/.test-data.json
```

### 7.3 Unified fixtures (`fixtures/index.ts`)

The final implementation uses one fixture entrypoint for all suites:

- Exposes `authenticatedPage` for logged-in flows
- Exposes shared page objects (`editor`, `nav`, `dashboard`, `loginPage`, `signupPage`, `fullscreen`, `modal`)
- Exposes `testData` from global setup
- Sets cookie consent state up front to avoid consent-popup flake

This keeps test files compact and ensures selector logic lives in reusable POM classes.

---

## 8. Covered User Flows

### 8.1 Unauthenticated Flows

**Flow 1: User can write code and run sketch previews without logging in**

```
GIVEN  I am not logged in
WHEN   I navigate to the editor (/)
AND    I write p5.js code in the editor
AND    I click the Run / Play button
THEN   the preview iframe loads and shows the sketch output
AND    no sign-in prompt is shown
```

Accessibility check: axe-core scan of the full IDE view passes WCAG 2.2 AA.

---

**Flow 2: User sees a sign-up prompt when trying to save**

```
GIVEN  I am not logged in
WHEN   I navigate to the editor (/)
AND    I click the Save button (or use Ctrl+S)
THEN   I am shown a sign-up / login prompt
AND    I am NOT redirected away from my sketch (code is preserved)
```

---

**Flow 3: User can download a sketch without logging in**

```
GIVEN  I am not logged in
WHEN   I navigate to the editor (/)
AND    I trigger the File > Download menu
THEN   a .zip file download is initiated
AND    I do not need to log in first
```

---

### 8.2 Authenticated Flows

**Flow 4: User can write code and run sketch previews while logged in**

```
GIVEN  I am logged in as test_auth@e2e.test
WHEN   I navigate to the editor (/)
AND    I write p5.js code
AND    I click Run
THEN   the preview iframe loads
```

Accessibility check: axe-core scan of the IDE view.

---

**Flow 5: User can save a new sketch and see changes persist**

```
GIVEN  I am logged in
WHEN   I navigate to the editor (/)
AND    I write some p5.js code
AND    I click Save
THEN   the sketch is saved (URL updates to /:username/sketches/:id)
WHEN   I navigate to that URL in a new tab/refresh
THEN   the same code is present in the editor
```

Requires test database — verifies the save API + MongoDB persistence roundtrip.

---

**Flow 6: User can edit an existing sketch and save changes**

```
GIVEN  I am logged in
AND    a sketch "My E2E Sketch" exists (seeded in globalSetup)
WHEN   I navigate to that sketch URL
AND    I modify the code in the editor
AND    I save
THEN   the changes persist on reload
```

---

**Flow 7: User can log out**

```
GIVEN  I am logged in
WHEN   I click the user menu
AND    I click Log Out
THEN   I am redirected to the editor in unauthenticated state
AND    if I navigate to /account, I am redirected to /login
AND    session cookie is cleared
```

---

### 8.3 Accessibility-Only Flows (a11y/)

These tests navigate to pages and run axe-core scans, reporting WCAG 2.2 violations:

| Test             | Page           | WCAG Tags       |
| ---------------- | -------------- | --------------- |
| `editor.spec.ts` | `/` (main IDE) | wcag2a, wcag2aa |
| `login.spec.ts`  | `/login`       | wcag2a, wcag2aa |
| `signup.spec.ts` | `/signup`      | wcag2a, wcag2aa |

---

## 9. GitHub Actions Workflow

**File:** `.github/workflows/e2e.yml`

```yaml
name: e2e

on:
  pull_request:
    branches:
      - development

jobs:
  e2e:
    name: End-to-end tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start e2e test environment
        run: docker compose -f docker-compose.e2e.yml up -d --wait

      - name: Run e2e tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Stop e2e test environment
        if: always()
        run: docker compose -f docker-compose.e2e.yml down -v
```

**Key decisions:**

- `branches: [development]` — exactly matches the project outcome requirement
- `--with-deps chromium` — installs only Chromium + OS deps (fast, small CI)
- `docker compose up -d --wait` — blocks until healthcheck passes
- `if: always()` on teardown → containers always cleaned up, even on test failure
- `-v` on `down` → removes ephemeral volumes, ensuring clean state
- `retention-days: 7` → report available for a week for debugging

---

## 10. Contributing Docs Update

A new section **"End-to-End (E2E) Tests"** is added to `CONTRIBUTING.md`:

### 10.1 Running locally

```bash
# Start the full stack
docker compose -f docker-compose.e2e.yml up -d --wait

# Run all e2e tests (headless)
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui

# Run headed (see the browser)
npm run test:e2e:headed

# View last report
npm run test:e2e:report

# Stop the stack when done
docker compose -f docker-compose.e2e.yml down -v
```

### 10.2 Writing a new e2e test

Short guide covering: importing the auth fixture, where to put new spec files, the naming convention, and how to add axe-core scans.

### 10.3 Unimplemented flows (contributor backlog)

Clearly documented for future contributors to pick up as scoped issues.

#### Implemented and passing (38 tests total)

| User Flow | Spec File | Priority |
| --- | --- | --- |
| User can log in via the login form | `authenticated/login-flow.spec.ts` | HIGH |
| Login shows an error for invalid credentials | `authenticated/login-flow.spec.ts` | HIGH |
| Login link is accessible from the nav | `authenticated/login-flow.spec.ts` | HIGH |
| Signup form renders with required fields | `unauthenticated/signup-flow.spec.ts` | HIGH |
| Signup form shows validation errors on empty submit | `unauthenticated/signup-flow.spec.ts` | HIGH |
| Signup page links to login page | `unauthenticated/signup-flow.spec.ts` | HIGH |
| Nav signup link navigates to /signup | `unauthenticated/signup-flow.spec.ts` | HIGH |
| User can navigate to My Sketches from the nav | `authenticated/my-sketches.spec.ts` | HIGH |
| Seeded sketch appears in the sketch list | `authenticated/my-sketches.spec.ts` | HIGH |
| User can delete a sketch from the dashboard | `authenticated/my-sketches.spec.ts` | HIGH |
| User can duplicate a sketch via File > Duplicate | `authenticated/duplicate-sketch.spec.ts` | HIGH |
| Fullscreen preview loads at /full/:id | `unauthenticated/fullscreen-preview.spec.ts` | HIGH |
| Fullscreen preview has no editor toolbar | `unauthenticated/fullscreen-preview.spec.ts` | HIGH |
| Fullscreen preview URL with username also loads | `unauthenticated/fullscreen-preview.spec.ts` | HIGH |
| Download menu item is visible from File menu | `unauthenticated/download-sketch.spec.ts` | HIGH |
| Public sketch route stays accessible without redirect to /login | `unauthenticated/download-sketch.spec.ts` | HIGH |
| File > Share opens a modal with a sketch URL | `authenticated/share-modal.spec.ts` | HIGH |
| Share modal contains an embed snippet | `authenticated/share-modal.spec.ts` | HIGH |
| Console shows output after running a sketch with print() | `authenticated/console-output.spec.ts` | HIGH |
| Console shows a JS error for invalid code | `authenticated/console-output.spec.ts` | HIGH |
| Save prompt overlay includes login and signup links | `unauthenticated/save-prompt.spec.ts` | HIGH |
| Editor content remains after dismissing save prompt | `unauthenticated/save-prompt.spec.ts` | HIGH |
| Authenticated run flow keeps editor + preview visible | `authenticated/run-sketch.spec.ts` | HIGH |
| Authenticated nav shows current username | `authenticated/run-sketch.spec.ts` | HIGH |
| Full logout clears session and redirects protected routes | `authenticated/logout.spec.ts` | HIGH |
| Saving a new sketch updates URL and persists content | `authenticated/save-sketch.spec.ts` | HIGH |
| Editing and renaming an existing sketch persists after reload | `authenticated/edit-and-save.spec.ts` | HIGH |
| /account redirects to /login when unauthenticated | `unauthenticated/auth-redirects.spec.ts` | MEDIUM |
| /login renders a login form | `unauthenticated/auth-redirects.spec.ts` | MEDIUM |
| /reset-password renders without error | `unauthenticated/auth-redirects.spec.ts` | MEDIUM |
| Accessibility: editor page WCAG checks | `a11y/editor.spec.ts` | MEDIUM |
| Accessibility: login page WCAG checks | `a11y/login.spec.ts` | MEDIUM |
| Accessibility: signup page WCAG checks | `a11y/signup.spec.ts` | MEDIUM |
| Accessibility: My Sketches dashboard | `a11y/dashboard.spec.ts` | MEDIUM |
| Accessibility: Reset Password page | `a11y/dashboard.spec.ts` | MEDIUM |

#### Remaining backlog (Phase 3+)

| User Flow | Status | Notes |
| --- | --- | --- |
| User can reset their password via email | Not yet implemented | Requires email mock (nodemailer stub) |
| User can create a new collection | Not yet implemented | Needs dashboard navigation test |
| User can add a sketch to a collection | Not yet implemented | Depends on collection creation flow |
| User can manage uploaded assets | Not yet implemented | File upload interactions |
| User can log in with GitHub OAuth | Not yet implemented | Requires OAuth provider stub |
| User can log in with Google OAuth | Not yet implemented | Requires OAuth provider stub |
| User can use Ctrl+Enter keyboard shortcut to run a sketch | Not yet implemented | Keyboard event testing |
| User can search for sketches in the dashboard | Not yet implemented | Depends on dashboard navigation test |
| Visibility toggle: sketch public ↔ private | Not yet implemented | Depends on dashboard navigation |
| Preferences: theme switch (light/dark) | Not yet implemented | Needs account preferences page |
| Accessibility: account settings page | Not yet implemented | Extend a11y/ folder |

---

## 11. Implementation Phases

| Phase | Deliverable | Acceptance Criteria |
| --- | --- | --- |
| **1 — Infrastructure** | Playwright installed, docker-compose.e2e.yml, playwright.config.ts, globalSetup/Teardown, unified fixtures, package.json scripts | `npm run test:e2e` starts, connects to server, exits cleanly |
| **2 — Unauthenticated tests** | 3 unauthenticated spec files | All 3 flows pass in Chromium locally |
| **3 — Authenticated tests** | 4 authenticated spec files | All 4 flows pass, including DB persistence check |
| **4 — Accessibility tests** | 3 a11y spec files | axe-core scans run; known violations documented |
| **5 — CI workflow** | `.github/workflows/e2e.yml` | Workflow visible in GitHub Actions, triggers on PR to development |
| **6 — Docs** | CONTRIBUTING.md updated | Local run instructions work; backlog table complete |
| **7 — Extended test coverage** | Finalized POM suite (38 passing tests) | Login flow, signup, dashboard, delete, duplicate, fullscreen, share modal, console output, auth redirects, a11y scans |

---

## 11A. Final Architecture Notes (Post-Implementation)

### 11A.1 Final POM + Fixture model

The delivered suite moved from a narrow auth-only fixture to a unified fixture and page-object architecture:

- `e2e/fixtures/index.ts` is the single import for tests (`import { test, expect } from '../../fixtures';`)
- Page objects in `e2e/pages/` centralize selectors and common operations
- `authenticatedPage` is injected where login state is required
- `testData` from global setup is shared through fixtures to avoid hardcoded IDs

### 11A.2 Stability decisions adopted

1. **Fresh auth cookie per test context** via API login helpers, minimizing cross-test session coupling.
2. **No `networkidle` waits** in assertions; tests wait for deterministic UI/API signals.
3. **Force-click support in base/page helpers** for dev-only pointer overlays (for example Redux DevTools overlays).
4. **Cookie-consent pre-seeding** (`p5-cookie-consent`) to prevent consent modal interference.
5. **Deterministic waits over sleeps** (`toBeVisible`, `toHaveURL`, targeted `waitForResponse`) for reproducibility.

### 11A.3 How to add a new test with POM

1. Pick the suite folder: `e2e/tests/unauthenticated/`, `e2e/tests/authenticated/`, or `e2e/tests/a11y/`.
2. Import the unified fixtures entrypoint.
3. Use existing page objects; add a method to a page class if behavior is reused.
4. For authenticated tests, destructure `authenticatedPage: page` from fixtures.
5. Use deterministic assertions and route/API-specific waits.

```ts
import { test, expect } from '../../fixtures';

test('example: unauthenticated editor smoke', async ({ editor, nav }) => {
  await editor.gotoNew();
  await expect(nav.loginLink).toBeVisible();
  await expect(editor.editorArticle).toBeVisible();
});
```

---

## 12. Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| App takes too long to start in CI | Medium | Docker healthcheck + `--wait`; 20 min job timeout |
| Tests are flaky due to timing | Medium | `retries: 2` in CI; explicit `waitFor` over hard sleeps |
| axe-core finds existing violations | High | Report violations without failing on first iteration; document known issues |
| CodeMirror editor interactions are complex | Medium | Use `.fill()` on the CM textarea directly; investigate CM test helpers |
| Seeded data leaks between tests | Low | Each test operates on isolated data; globalTeardown cleans up |
| OAuth flows untestable | High (certain) | Explicitly scoped to backlog; documented as requiring OAuth stub |

---

## 13. Reference Links

- [Existing test workflow](https://github.com/processing/p5.js-web-editor/tree/develop/.github/workflows)
- [Current integration test](https://github.com/processing/p5.js-web-editor/blob/develop/client/index.integration.test.jsx)
- [Playwright setup example from p5.js website (PR #933)](https://github.com/processing/p5.js-website/pull/933)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.2 guidelines](https://www.w3.org/TR/WCAG22/)
