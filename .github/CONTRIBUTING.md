# Contributing to the p5.js Editor 📖 🐛 🎨

Welcome to the Contributor Guidelines!

This document is for anyone interested in contributing to the p5.js Editor—whether you're new to open source, refreshing your memory on some technical steps, or curious about how the codebase works!

We believe that anyone can be a contributor; you don't need to be an expert. We also know that not everyone has the same time, energy, or resources to spend, and that's okay. We're just glad you're here!

This guide has been adapted from the Contributor Guidelines within the [Processing](https://github.com/processing/processing4/blob/main/CONTRIBUTING.md) and [p5.js](https://github.com/processing/p5.js/blob/main/contributor_docs/contributor_guidelines.md) repositories. They're full of helpful and in-depth resources—please check them out!

If you haven't already, read our [Community and Statement Code of Conduct](https://editor.p5js.org/code-of-conduct) to understand the values that guide our community and how to participate respectfully and constructively.

## Table of Contents

- [About Github](#about-github)
- [How Can I Contribute?](#how-can-i-contribute)
- [Working Within the Codebase](#working-within-the-codebase)
- [Ideas for Getting Started](#ideas-for-getting-started)

## About Github

The p5.js Editor's codebase is hosted on [GitHub](https://github.com/processing). GitHub is a website where people can collaborate on code. It's widely used for open source projects and makes it easier to keep track of changes, report issues with the software, and contribute improvements to the code.

If you're new to GitHub, a good place to start is the [First Contribution's tutorial guide](https://github.com/firstcontributions/first-contributions/blob/main/docs/gui-tool-tutorials/github-desktop-tutorial.md), which walks you through the basics of contributing to a project using GitHub Desktop. For more information, we recommend [Git and GitHub for Poets](https://www.youtube.com/playlist?list=PLRqwX-V7Uu6ZF9C0YMKuns9sLDzK6zoiV), a beginner-friendly video series.

The [Hello World](https://guides.github.com/activities/hello-world/) and [Forking](https://guides.github.com/activities/forking/) Guides from Github are also great acitivities for exercising how you might want to use these tools and features.

## How Can I Contribute?

If you're new to open source, start by reading [this beginner-friendly guide about contributing to an open source project](https://opensource.guide/how-to-contribute/). It covers why you might want to contribute to a project, what it means to contribute, and how to navigate certain aspects of the contribution process.

### First Steps

As you start navigating the p5.js editor and the codebase, you may want to think about what you're hoping to learn by working on open source project. The p5.js editor is a full-stack web application, therefore there's tons of different areas that you could focus on. Some of them can look like:

- **Translation** – Help localize the software and documentation in your language. Many of us made our first contribution this way.
- **Testing** – Try out new releases and report bugs.
- **Documentation** – Improve tutorials, reference pages, or even this guide!
- **Design** – Contribute UI design ideas or help improve user experience.
- **Project Management** - Organizing tickets, pull requests, and tasks.
- **Front-End Development** - We use React/Redux, CSS/Sass, and CodeMirror.
- **Back-End Development** - We use Node, Express, MongoDB, Jest, and AWS.
- **DevOps** - Some tools we use are Travis CI, Jest, Docker, Kubernetes, and AWS.
- **Community Support** – Answer questions on the forum.
- **Education** – Create learning resources, curriculums, organize workshops, or share your teaching experiences.
- **Art and Projects** – Share what you're making with p5.js or the p5.js Editor!
- **Outreach and Advocacy** – Help others discover and get excited about the project.

Once you've found something you're excited to contribute to, reference the relevant guides and documentation to make sure you're following the recommended process.

## Working Within the Codebase

### Making Your First Contribution

Issues with these labels are a great place to start!

- [Help Wanted](https://github.com/processing/p5.js-web-editor/labels/Help%20Wanted)
- [Good First Issue](https://github.com/processing/p5.js-web-editor/labels/Good%20First%20Issue)
- [Need Steps to Reproduce](https://github.com/processing/p5.js-web-editor/labels/Needs%20Steps%20to%20Reproduce)
- [Ready for Work](https://github.com/processing/p5.js-web-editor/labels/Ready%20for%20Work)

A breakdown of what each label means can be found in the [Preparing an Issue Guide](../contributor_docs/preparing_an_issue.md).

When approaching these issues, know that it's okay to not know how to fix an issue! Feel free to ask questions about to approach the problem. We are all here to learn and make something awesome. Someone from the community will help you out, and asking questions is a great way to learn about the p5.js editor, its file structure, and development process.

### Before You Start Working On An Issue

Before beginning work on a code contribution, please make sure that:

- The issue has been discussed and a proposed solution has been agreed upon.
- You have been assigned to the issue.
- If an implementation has been agreed upon but no one has volunteered to take it on, feel free to comment and offer to help. A maintainer can then assign the issue to you.

### Choosing an Issue

The best way to verify if an issue is ready to be worked on is checking if it has the [Ready for Work](https://github.com/processing/p5.js-web-editor/labels/Ready%20for%20Work) label. However, here are a few other suggestions to keep in mind as you explore the issues:

- **Please do not open a pull request for an issue that is already assigned to someone else**. We follow a "first assigned, first served" approach to avoid duplicated work. If you open a PR for an issue that someone else is already working on, your PR will be closed.

- If an issue has been inactive for a long time, you're welcome to check in politely by commenting to see if the assignee still plans to work on it or would be open to someone else taking over.

- There's no hard deadline for completing contributions. We understand that people often contribute on a volunteer basis and timelines may vary. That said, if you run into trouble or have questions at any point, don't hesitate to ask for help in the issue thread. Maintainers and other community members are here to support you.

### Before Submitting a Pull Request

Before submitting a pull request, make sure that:

- Your work is related to an issue. **Pull requests that do not have an associated issue will not be accepted.**
- Your work adheres to the style guidelines and fits in with the rest of the codebase.
- You ran the project locally and tested your changes. Pay special attention to any specific areas of the p5.js editor that may be affected by your changes. Does everything still work as before? Great!
- You reference the [Preparing a Pull Request Guide](https://github.com/processing/p5.js-web-editor/blob/develop/contributor_docs/preparing_a_pull_request.md) for more details!

---

## Ideas for Getting Started

- Use the [p5.js Editor](https://editor.p5js.org)! Find a bug? Think of something you think would add to the project? Reference the [Preparing an Issue Guide](../contributor_docs/preparing_an_issue.md) and open an issue.
- Expand an existing issue. Sometimes issues are missing steps to reproduce, or need suggestions for potential solutions. Sometimes they need another voice saying, "this is really important!"
- Try getting the project running locally on your computer by following the [installation steps](./../contributor_docs/installation.md).
- Look through the documentation in the [developer docs](../contributor_docs/) and the [development guide](./../contributor_docs/development.md). Is there anything that could be expanded? Is there anything missing?

## End-to-End (E2E) Tests

The e2e test suite uses [Playwright](https://playwright.dev/) and runs against a real full-stack environment (Node.js app + MongoDB) via Docker Compose.

### Current Status

- `38` Playwright tests are currently passing in the maintained e2e suite.
- Tests are organized around Page Object Model (POM) classes and a unified fixture entrypoint.
- The suite covers authenticated flows, unauthenticated flows, and accessibility checks.

### Running E2E Tests Locally

**Prerequisites:** Docker and Docker Compose must be installed.

```bash
# 1. Start the full test stack (app + MongoDB)
docker compose -f docker-compose.e2e.yml up -d --wait

# 2. Run all e2e tests (headless)
npm run test:e2e

# 3. (Optional) Run with interactive Playwright UI
npm run test:e2e:ui

# 4. (Optional) Run with a visible browser window
npm run test:e2e:headed

# 5. View the HTML report from the last run
npm run test:e2e:report

# 6. Stop the test stack when done
docker compose -f docker-compose.e2e.yml down -v
```

> **Note:** The first run may take a few minutes while Docker builds the app image and Webpack compiles the client bundle.

### Test Structure

```
e2e/
├── playwright.config.ts          # Playwright configuration
├── global-setup.ts               # Seeds test users/projects before the suite
├── global-teardown.ts            # Cleans up seeded data after the suite
├── fixtures/
│   └── index.ts                  # Unified fixtures (authenticatedPage + page objects + testData)
├── pages/
│   ├── base.page.ts              # Shared helpers (force click, cookie-consent helpers)
│   ├── editor.page.ts            # Editor interactions (run/save/share/duplicate/download)
│   ├── nav.page.ts               # Top navigation and account menu interactions
│   ├── dashboard.page.ts         # My Sketches list and sketch-card actions
│   ├── login.page.ts             # Login form interactions and assertions
│   ├── signup.page.ts            # Signup form interactions and assertions
│   ├── fullscreen.page.ts        # /full/:id routes and fullscreen assertions
│   └── modal.page.ts             # Overlay/modal helpers (save prompt/share modal)
├── tests/
│   ├── unauthenticated/          # Tests that run without authentication
│   ├── authenticated/            # Tests that require a logged-in user
│   └── a11y/                     # WCAG accessibility scans
└── utils/
    ├── api-helpers.ts            # Shared API call helpers
    └── constants.ts              # Shared constants (BASE_URL, MONGO_URL, etc.)
```

### Stability Decisions (Final)

- **Fresh auth cookie per test:** authenticated fixtures log in through the real API so each test gets an isolated session cookie.
- **Avoid `networkidle`:** tests wait for specific UI states or API responses instead of global idle heuristics.
- **Force click for dev overlays:** shared page helpers use force-click where Redux DevTools/pointer overlays can intercept clicks.
- **Cookie-consent handling:** fixtures/pages set `p5-cookie-consent` to prevent consent popups from causing unrelated failures.
- **Deterministic waits only:** expectations and targeted `waitForResponse` checks are preferred over brittle timing assumptions.

### Writing a New E2E Test

1. Create a new `.spec.ts` file in `e2e/tests/unauthenticated/`, `e2e/tests/authenticated/`, or `e2e/tests/a11y/`.
2. Import from the unified fixtures entrypoint: `import { test, expect } from '../../fixtures';`.
3. Use injected page objects from fixtures (`editor`, `nav`, `dashboard`, `loginPage`, `signupPage`, `fullscreen`, `modal`) instead of raw selector duplication.
4. For authenticated scenarios, use `authenticatedPage` (for example, `async ({ authenticatedPage: page, editor, nav }) => { ... }`).
5. Reuse POM methods and assertions in `e2e/pages/` and add new page methods there when a behavior is shared by multiple tests.
6. Keep waits deterministic (`toBeVisible`, `toHaveURL`, `waitForResponse`) and avoid introducing broad load-state waits.

Minimal template:

```ts
import { test, expect } from '../../fixtures';

test('example flow', async ({ editor, nav }) => {
  await editor.gotoNew();
  await expect(nav.loginLink).toBeVisible();
  await expect(editor.editorArticle).toBeVisible();
});
```

### Unimplemented User Flows

The following flows are documented but not yet implemented. Each is a well-scoped task — please open an issue and reference this list if you pick one up.

| User Flow | Notes |
| --- | --- |
| User can reset their password via email | Requires nodemailer stub (no real email in tests) |
| User can create a new collection | Dashboard navigation test |
| User can add a sketch to a collection | Depends on collection creation flow |
| User can manage uploaded assets | File upload interactions |
| User can log in with GitHub OAuth | Requires OAuth provider stub |
| User can log in with Google OAuth | Requires OAuth provider stub |
| User can use keyboard shortcuts (Ctrl+S, Ctrl+Enter) | Keyboard event testing in CodeMirror |
| User can search for sketches in the dashboard | Dashboard navigation test |
| Accessibility: all dashboard pages | Extend `e2e/tests/a11y/` |
| Accessibility: account settings page | Extend `e2e/tests/a11y/` |
