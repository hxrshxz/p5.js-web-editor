# LFX Proposal: Playwright E2E Reliability and Coverage for p5.js Web Editor

**Date:** 2026-02-28  
**Project:** p5.js Web Editor  
**Track:** LFX Mentorship (175H Medium)  
**Focus:** End-to-end testing architecture, stability, and contributor sustainability

---

## Executive Summary

This proposal documents the final design and implementation strategy for the Playwright end-to-end (e2e) suite in the p5.js Web Editor. The project delivers a production-relevant test safety net across authenticated flows, unauthenticated flows, and accessibility checks, using a real application stack (Node app + MongoDB) and deterministic test practices suitable for CI.

The implementation has reached a stable baseline of **38 passing e2e tests** and a finalized Page Object Model (POM) architecture with a **unified fixtures entrypoint**. This combination reduces selector drift, limits repetitive boilerplate, and enables new contributors to add reliable test coverage without deep familiarity with internal UI implementation details.

The core value delivered is not just test quantity, but test quality: architecture choices explicitly target flakiness, reproducibility, and maintainability. Decisions include API-first session seeding, fresh auth cookies for isolation, deterministic waits instead of broad load-state heuristics, and defensive handling for local/dev overlays and cookie-consent UX that otherwise destabilize automation.

This proposal provides rationale, trade-offs, implementation details, quality gates, risk controls, and a mentorship execution timeline that can be directly evaluated for LFX outcomes.

---

## Project Motivation and Problem Statement

The p5.js Web Editor is actively evolving (ongoing TypeScript migration, self-hosting discussions, and regular feature work). Before this e2e effort, regression risk was concentrated in areas that unit tests cannot fully protect:

- user authentication/session behaviors
- editor run/save workflows
- dashboard sketch management
- accessibility regressions in major user entry points

Historically, these flows were validated manually, increasing release risk and reviewer burden. Subtle breakage in multi-step paths (for example, login + save + reload persistence) could pass local checks yet fail for users.

This project addresses the gap by implementing a maintainable e2e framework that:

1. Exercises real user workflows across server, client, and database boundaries.
2. Runs in a reproducible environment locally and in CI.
3. Encodes stability conventions so failures signal product regressions, not test fragility.
4. Lowers the barrier for contributors to extend coverage safely.

---

## Scope and Non-Goals

### In Scope

- Playwright-based e2e suite in repository-native structure (`e2e/`).
- Unified fixtures and reusable POM classes.
- Coverage for authenticated, unauthenticated, and a11y scenarios.
- Deterministic setup/teardown and API helpers.
- CI-friendly execution strategy and reporting.
- Contributor documentation for adding tests and extending page objects.

### Non-Goals (Current Iteration)

- Full OAuth flow automation (GitHub/Google) without provider stubs.
- Visual regression screenshot baselining.
- Cross-browser matrix in CI (Chromium-first for speed and cost control).
- Performance benchmarking and load testing.
- Full mobile/touch interaction certification.

---

## Architecture Overview

### Final Directory Model

```text
e2e/
├── fixtures/
│   └── index.ts
├── pages/
│   ├── base.page.ts
│   ├── editor.page.ts
│   ├── nav.page.ts
│   ├── dashboard.page.ts
│   ├── login.page.ts
│   ├── signup.page.ts
│   ├── fullscreen.page.ts
│   └── modal.page.ts
├── tests/
│   ├── authenticated/
│   ├── unauthenticated/
│   └── a11y/
├── utils/
│   ├── api-helpers.ts
│   └── constants.ts
├── global-setup.ts
├── global-teardown.ts
└── playwright.config.ts
```

### Core Architectural Pattern

- **Unified fixtures** provide a single import surface (`../../fixtures`) for all test categories.
- **POM classes** centralize selectors and interaction logic.
- **Global setup/teardown** owns lifecycle of seeded entities and shared test data.
- **API helpers** support controlled login and project lifecycle operations using production-style routes.

### Why this architecture fits p5.js Web Editor

- The editor UI is dense and interactive; selector reuse is essential.
- The app has both public and authenticated route variants; fixture-controlled auth prevents duplicated setup.
- Contributor turnover is expected in open source; a predictable test API reduces onboarding time.

---

## Decision Log

This section records major implementation decisions, alternatives, and trade-offs.

### 1) Playwright as e2e framework

- **Decision:** Use Playwright as the primary framework.
- **Why:** Fast runner, first-class trace/report tooling, strong CI ergonomics, robust locator API.
- **Alternatives considered:** Cypress, WebdriverIO.
- **Trade-offs:** Playwright setup can feel heavier initially, but provides stronger long-term stability and tooling.

### 2) Unified fixtures instead of multiple narrow fixtures

- **Decision:** Consolidate into `e2e/fixtures/index.ts`.
- **Why:** Reduces import confusion and keeps test signatures consistent.
- **Alternatives considered:** Separate auth and non-auth fixtures.
- **Trade-offs:** A single fixture file is larger, but discoverability and contributor UX improve.

### 3) POM layer in `e2e/pages/`

- **Decision:** Standardize page objects for editor/nav/dashboard/auth/modal routes.
- **Why:** Selector changes happen once; behavior helpers become reusable.
- **Alternatives considered:** Inline selectors in each spec.
- **Trade-offs:** Slight upfront abstraction cost, significant maintenance savings over time.

### 4) API-first auth/session setup

- **Decision:** Use login API helpers and session cookies for authenticated context.
- **Why:** Faster than repetitive UI login, closer to server truth, less flaky UI setup chains.
- **Concrete project detail:** login route is namespaced under `/editor` (`/editor/login`).
- **Alternatives considered:** UI-only login in every test.
- **Trade-offs:** Requires cookie parsing utilities, but substantially improves test speed and reliability.

### 5) Respect passport email-based login contract

- **Decision:** Authenticate with `email` field (not username) in API helper payloads.
- **Why:** Backend uses `passport-local` with `usernameField: 'email'`.
- **Alternatives considered:** username credential handling.
- **Trade-offs:** Slightly stricter test-data design; avoids false negatives from misaligned credentials.

### 6) Fresh auth cookie strategy

- **Decision:** Obtain fresh auth cookies for relevant tests rather than reusing one mutable session everywhere.
- **Why:** Isolates tests and limits hidden coupling across flows.
- **Alternatives considered:** one shared long-lived session cookie.
- **Trade-offs:** Additional login calls, but cleaner isolation and easier debugging.

### 7) Deterministic waits over `networkidle`

- **Decision:** Avoid broad idle heuristics; wait for specific UI states and known API responses.
- **Why:** Rich client behavior and background activity make idle state unreliable for correctness.
- **Alternatives considered:** generic `waitForLoadState('networkidle')` usage.
- **Trade-offs:** More explicit assertions to write, but reduced flake and better failure diagnostics.

### 8) Force-click fallback for dev overlays

- **Decision:** Use force-click helper where pointer interception can occur.
- **Why:** In development-like environments, overlays (including Redux DevTools-related overlays) can block normal click paths.
- **Alternatives considered:** pure standard click and retries.
- **Trade-offs:** Force-click must be scoped carefully to avoid hiding genuine z-index bugs.

### 9) Cookie-consent stabilization

- **Decision:** Pre-set `p5-cookie-consent` cookie in fixture/base helpers.
- **Why:** Consent overlays are non-functional noise for most workflow tests and a common source of unrelated failures.
- **Alternatives considered:** dismiss banner through UI each test.
- **Trade-offs:** Does not validate consent UX by default; dedicated consent tests can be added separately.

### 10) Keyboard-save behavior coverage

- **Decision:** Keep save-flow behavior compatible with keyboard shortcut path (`Ctrl+S`) for unauthenticated prompt validation and editor workflows.
- **Why:** Keyboard-driven interactions are core to editor UX.
- **Alternatives considered:** click-only save actions.
- **Trade-offs:** Key handling can vary across platforms; tests should remain explicit and scoped.

### 11) Environment constant strategy including `PREVIEW_URL`

- **Decision:** Centralize environment assumptions in constants utilities, including preview-related route targets.
- **Why:** Prevents hardcoded URL drift and keeps route assumptions transparent.
- **Alternatives considered:** in-test literal URLs.
- **Trade-offs:** One extra indirection layer, improved maintainability and consistency.

---

## Infrastructure Strategy

### Docker-first execution model

- Use `docker-compose.e2e.yml` to run app + MongoDB in a reproducible stack.
- Keep environment close to production topology while preserving test isolation.
- Use health checks and controlled startup sequencing before tests begin.

### Environment variables and config discipline

Key environment concerns:

- dedicated test database URL
- Node test mode behavior
- session secret for test runtime only
- base URL and preview URL constants for route assertions

Configuration is centralized in Playwright config and e2e constants to minimize test-level configuration drift.

### Setup and teardown lifecycle

- **Global setup:** validate service readiness, seed auth user/project, persist minimal shared metadata.
- **Per-test setup via fixtures:** provide page objects and auth context when required.
- **Global teardown:** clean seeded entities and remove transient artifacts.

This lifecycle keeps the suite deterministic while avoiding expensive full reseeding before every individual test.

---

## Testing Strategy

### Authenticated flows

Focus on behavior that requires account context and persistence guarantees:

- login success and failure
- run and preview while authenticated
- save/edit persistence
- dashboard listing and deletion
- duplicate/share/console interactions
- logout/session invalidation

### Unauthenticated flows

Validate public usability and guest behavior:

- editor loads and runs sketches
- save prompt appears for guest users
- public/fullscreen routes remain accessible
- signup and auth redirects are correct

### Accessibility flows

Run axe-based WCAG checks on key entry points and dashboard pages. Accessibility checks are treated as first-class regression protection and included alongside functional tests, not deferred to manual audits.

---

## Current Implemented Test Catalog (38 Passing)

### Authenticated suite (`e2e/tests/authenticated/`)

- `login-flow.spec.ts` (3 tests)
- `run-sketch.spec.ts` (2 tests)
- `save-sketch.spec.ts` (1 test)
- `edit-and-save.spec.ts` (1 test)
- `logout.spec.ts` (1 test)
- `my-sketches.spec.ts` (3 tests)
- `duplicate-sketch.spec.ts` (1 test)
- `share-modal.spec.ts` (2 tests)
- `console-output.spec.ts` (2 tests)

**Subtotal:** 16 tests

### Unauthenticated suite (`e2e/tests/unauthenticated/`)

- `run-sketch.spec.ts` (2 tests)
- `save-prompt.spec.ts` (3 tests)
- `download-sketch.spec.ts` (2 tests)
- `fullscreen-preview.spec.ts` (3 tests)
- `signup-flow.spec.ts` (4 tests)
- `auth-redirects.spec.ts` (3 tests)

**Subtotal:** 17 tests

### Accessibility suite (`e2e/tests/a11y/`)

- `editor.spec.ts` (1 test)
- `login.spec.ts` (1 test)
- `signup.spec.ts` (1 test)
- `dashboard.spec.ts` (2 tests)

**Subtotal:** 5 tests

**Total passing tests:** 38

---

## Future Test Scenarios and Prioritized Backlog

### Priority 1 (high user impact, medium complexity)

1. Password reset email end-to-end path (with controlled mail stub).
2. Collection creation and sketch-to-collection workflows.
3. Sketch search and filtering in dashboard.

**Rationale:** These flows are common user paths with meaningful data behavior and high regression impact.

### Priority 2 (high integration complexity)

1. OAuth login (GitHub, Google) with provider stubbing strategy.
2. Upload assets workflow (file handling and validation states).
3. Public/private visibility toggle lifecycle.

**Rationale:** Higher setup complexity but important for ecosystem integrations and sharing workflows.

### Priority 3 (experience and quality depth)

1. Theme/preferences persistence checks.
2. Additional a11y coverage for account settings and advanced dialogs.
3. Keyboard shortcut matrix expansion (including run shortcut variants).

**Rationale:** Increases UX quality and long-term confidence after critical user journeys are secured.

---

## Quality Gates, CI Strategy, and Flakiness Mitigation

### Quality gates

- e2e suite must complete successfully before merge approval in relevant branches.
- Failures require either a fix or explicit triage issue with owner.
- Accessibility failures are tracked with severity and remediation path.

### CI strategy

- Chromium-first CI execution for predictable runtime and resource cost.
- Artifacts (Playwright report, traces/screenshots on failure) retained for diagnosis.
- Controlled retries in CI only where necessary.

### Flakiness mitigation practices

- deterministic selector strategy through POM
- deterministic wait strategy (state/response-based)
- fresh auth cookie and controlled seeded state
- cookie-consent suppression for unrelated UI noise
- force-click helper only where overlay interference is known

---

## Risk Register and Mitigations

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| CI startup timing variance | Medium | Medium | Health checks + explicit readiness in setup |
| Session coupling across tests | High | Medium | Fresh cookie strategy + isolated setup patterns |
| Selector drift from UI refactors | Medium | High | POM indirection and shared fixture APIs |
| External dependency instability (OAuth/email) | Medium | High | Stub strategy + phased backlog coverage |
| False failures from non-critical overlays | Low | Medium | Force-click helper and cookie-consent preset |
| Accessibility debt accumulation | High | Medium | Dedicated a11y suite + issue-driven remediation |

---

## Mentorship Collaboration Plan

### Cadence

- Weekly mentor sync for scope review, blockers, and architectural checkpoints.
- Mid-week async update with evidence (test matrix, failures, design notes).

### Collaboration artifacts

- decision log updates for any architecture change
- prioritized backlog updates with risk/impact score
- PR notes that include reliability rationale, not just implementation detail

### Feedback loop

- Mentor reviews emphasize trade-offs and maintainability.
- Contributor documentation is updated continuously so outcomes are reusable by the community.

---

## Success Metrics and Measurable Outcomes

### Primary metrics

- Stable baseline of **38 passing tests** maintained.
- Reduced manual regression validation for key user workflows.
- Documented conventions for adding new tests with low onboarding friction.

### Secondary metrics

- Lower flaky-test incident rate over mentorship period.
- Faster PR confidence checks for editor-critical changes.
- Increased contributor throughput for adding/maintaining e2e coverage.

### Outcome signals

- Contributors can add new POM-aligned tests without introducing duplicated selector logic.
- CI failures more often indicate real regressions than timing artifacts.

---

## Week-by-Week Execution Plan (Mentorship Timeline)

### Week 1: Baseline and architecture hardening

- confirm fixture/page-object boundaries
- finalize setup/teardown reliability
- align constants and route assumptions

### Week 2: Core workflow consolidation

- stabilize authenticated run/save/edit/logout flows
- stabilize unauthenticated run/save prompt/signup flows
- remove brittle waits

### Week 3: Coverage expansion and CI confidence

- complete dashboard/share/duplicate/console scenarios
- tune CI retries, workers, and artifact capture
- ensure deterministic failure diagnostics

### Week 4: Accessibility and contributor enablement

- expand a11y suite coverage
- update contributor docs for POM workflow
- ensure examples are copy-paste ready

### Week 5: Backlog framing and risk-driven planning

- formalize future scenarios (OAuth, password reset, collections)
- sequence by impact and feasibility
- document stub/integration requirements

### Week 6: Proposal finalization and handoff quality

- validate that architecture docs mirror implementation reality
- publish proposal-quality narrative and command appendix
- summarize measurable impact and community value

---

## Contribution Value to p5.js Web Editor and Community

This work creates durable value beyond a single test pass snapshot:

- It establishes a clear reliability contract for editor-critical user journeys.
- It reduces contributor uncertainty by documenting the "right" way to add tests.
- It aligns quality expectations across maintainers, mentees, and first-time contributors.
- It turns e2e work into a teachable, extensible subsystem instead of ad hoc scripts.

For the p5.js community, this improves confidence that creative workflows remain stable during active product evolution.

---

## Appendix A: Command References

```bash
# Start test stack
docker compose -f docker-compose.e2e.yml up -d --wait

# Run e2e tests (headless)
npm run test:e2e

# Open Playwright UI mode
npm run test:e2e:ui

# Run headed mode
npm run test:e2e:headed

# View latest report
npm run test:e2e:report

# Stop and clean test stack
docker compose -f docker-compose.e2e.yml down -v
```

---

## Appendix B: Troubleshooting Notes

### Symptom: clicks intermittently fail in dev-like environments

- Check if overlay interception is occurring.
- Use the shared force-click helper where this behavior is expected.

### Symptom: auth-dependent test unexpectedly redirects to login

- Verify cookie acquisition path through API helper.
- Confirm login payload uses `email` as credential field.

### Symptom: save flow assertion passes locally but flakes in CI

- Replace timing assumptions with explicit `waitForResponse` and URL assertions.
- Confirm routes are using `/editor/...` API prefix expectations.

### Symptom: consent dialog appears and blocks controls

- Confirm `p5-cookie-consent` pre-seeding in fixture/base helper.

### Symptom: fullscreen/preview assertions mismatch

- Validate `PREVIEW_URL` and route expectation sources are synchronized in constants.

---

## Appendix C: How to Add a New POM-Based Test

```ts
import { test, expect } from '../../fixtures';

test('example: new flow', async ({ authenticatedPage: page, editor, nav }) => {
  await editor.gotoNew();
  await nav.openFileMenu();
  await editor.pressCtrlS(); // Ctrl+S path when relevant
  await expect(page).toHaveURL(/editor|login|signup/);
});
```

Checklist:

1. Choose correct suite folder (`authenticated`, `unauthenticated`, `a11y`).
2. Reuse existing page object methods before adding new selectors.
3. Add new page method when behavior is reused by more than one test.
4. Keep waits deterministic and avoid broad load-state heuristics.
5. Keep assertions user-observable (URL/state/content), not implementation-only.
