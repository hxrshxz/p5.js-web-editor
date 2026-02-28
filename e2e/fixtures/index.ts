import * as fs from 'fs';
import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { EditorPage } from '../pages/editor.page';
import { FullscreenPage } from '../pages/fullscreen.page';
import { LoginPage } from '../pages/login.page';
import { ModalPage } from '../pages/modal.page';
import { NavPage } from '../pages/nav.page';
import { SignupPage } from '../pages/signup.page';
import { loginUser } from '../utils/api-helpers';
import { BASE_URL, TEST_DATA_PATH } from '../utils/constants';

export type TestData = {
  authUsername: string;
  authEmail: string;
  authPassword: string;
  seededProjectId: string;
  [key: string]: unknown;
};

type AppFixtures = {
  testData: TestData;
  authenticatedPage: Page;
  nav: NavPage;
  editor: EditorPage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  dashboard: DashboardPage;
  modal: ModalPage;
  fullscreen: FullscreenPage;
};

export const test = base.extend<AppFixtures>({
  testData: async ({ browserName: _browserName }, use) => {
    const parsed = JSON.parse(
      fs.readFileSync(TEST_DATA_PATH, 'utf-8')
    ) as TestData;
    await use(parsed);
  },

  // Dismiss cookie consent dialog globally before any test navigation
  page: async ({ page, baseURL }, use) => {
    const appUrl = new URL(baseURL ?? BASE_URL);
    await page.context().addCookies([
      {
        name: 'p5-cookie-consent',
        value: 'essential',
        domain: appUrl.hostname,
        path: '/'
      }
    ]);
    await use(page);
  },

  authenticatedPage: async ({ page, baseURL, testData }, use) => {
    const rawCookie = await loginUser({
      email: testData.authEmail,
      password: testData.authPassword
    });
    const appUrl = new URL(baseURL ?? BASE_URL);
    const cookies = parseCookieHeader(rawCookie);
    await page.context().addCookies(
      cookies.map((cookie) => ({
        ...cookie,
        domain: cookie.domain ?? appUrl.hostname,
        path: cookie.path ?? '/'
      }))
    );
    await use(page);
  },

  nav: async ({ page }, use) => {
    await use(new NavPage(page));
  },
  editor: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  dashboard: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  modal: async ({ page }, use) => {
    await use(new ModalPage(page));
  },
  fullscreen: async ({ page }, use) => {
    await use(new FullscreenPage(page));
  }
});

export { expect } from '@playwright/test';

type ParsedCookie = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Lax' | 'None' | 'Strict';
  expires?: number;
};

function parseCookieHeader(setCookieHeader: string): ParsedCookie[] {
  return splitSetCookieHeader(setCookieHeader)
    .map(parseSingleCookie)
    .filter((cookie): cookie is ParsedCookie => cookie !== null);
}

function splitSetCookieHeader(setCookieHeader: string): string[] {
  const parts = setCookieHeader.match(/(?:[^,]|,(?=[^;,\s]+=))+/g);
  return parts?.map((part) => part.trim()).filter(Boolean) ?? [];
}

function parseSingleCookie(rawCookie: string): ParsedCookie | null {
  const segments = rawCookie.split(';').map((segment) => segment.trim());
  const [nameValue, ...attributes] = segments;
  const eqIdx = nameValue.indexOf('=');
  if (eqIdx <= 0) {
    return null;
  }

  const cookie: ParsedCookie = {
    name: nameValue.slice(0, eqIdx).trim(),
    value: nameValue.slice(eqIdx + 1).trim()
  };

  attributes.forEach((attr) => {
    const [rawKey, ...rawValParts] = attr.split('=');
    const key = rawKey.trim().toLowerCase();
    const value = rawValParts.join('=').trim();

    if (key === 'domain' && value) {
      cookie.domain = value.startsWith('.') ? value.slice(1) : value;
      return;
    }
    if (key === 'path' && value) {
      cookie.path = value;
      return;
    }
    if (key === 'secure') {
      cookie.secure = true;
      return;
    }
    if (key === 'httponly') {
      cookie.httpOnly = true;
      return;
    }
    if (key === 'samesite') {
      const normalized = value.toLowerCase();
      if (normalized === 'lax') cookie.sameSite = 'Lax';
      if (normalized === 'none') cookie.sameSite = 'None';
      if (normalized === 'strict') cookie.sameSite = 'Strict';
      return;
    }
    if (key === 'max-age') {
      const seconds = Number.parseInt(value, 10);
      if (!Number.isNaN(seconds)) {
        cookie.expires = Math.floor(Date.now() / 1000) + seconds;
      }
      return;
    }
    if (key === 'expires') {
      const ts = Date.parse(value);
      if (!Number.isNaN(ts)) {
        cookie.expires = Math.floor(ts / 1000);
      }
    }
  });

  return cookie;
}
