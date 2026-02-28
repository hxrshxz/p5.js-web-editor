import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import { loginUser, createProject } from './utils/api-helpers';
import { BASE_URL, MONGO_URL, TEST_DATA_PATH } from './utils/constants';

const TEST_USER = {
  username: 'e2etestuser',
  email: 'e2etest@playwright.local',
  password: 'E2eTestP@ss1'
};

async function waitForServer(
  url: string,
  retries = 30,
  delayMs = 2000
): Promise<void> {
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const attempt = async (count: number): Promise<void> => {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 302 || res.status === 301) {
        return;
      }
    } catch {
      // ECONNREFUSED — server not up yet
    }

    if (count >= retries) {
      throw new Error(
        `Server at ${url} not ready after ${(retries * delayMs) / 1000}s`
      );
    }

    console.log(`[e2e setup] Waiting for server... (${count}/${retries})`);
    await sleep(delayMs);
    await attempt(count + 1);
  };

  await attempt(1);
}

export default async function globalSetup() {
  // Connect to MongoDB
  await mongoose.connect(MONGO_URL);

  // Hash password and insert test user directly into MongoDB
  // (bypasses email sending entirely)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(TEST_USER.password, salt);

  const usersCollection = mongoose.connection.collection('users');

  // Remove any leftover test user from a previous run
  await usersCollection.deleteOne({ username: TEST_USER.username });

  await usersCollection.insertOne({
    username: TEST_USER.username,
    email: TEST_USER.email,
    password: hashedPassword,
    verified: 'verified', // EmailConfirmationStates.Verified
    name: '',
    tokens: [],
    apiKeys: [],
    preferences: {
      fontSize: 18,
      lineNumbers: true,
      indentationAmount: 2,
      isTabIndent: false,
      autosave: true,
      linewrap: true,
      lintWarning: false,
      textOutput: false,
      gridOutput: false,
      theme: 'light',
      autorefresh: false,
      language: 'en-US',
      autocloseBracketsQuotes: true,
      autocompleteHinter: false
    },
    totalSize: 0,
    cookieConsent: 'none',
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await mongoose.disconnect();

  try {
    await waitForServer(BASE_URL);

    // Login via the API to get a session cookie
    const cookie = await loginUser({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    // Create a test project via the API
    const project = await createProject('e2e-test-project', cookie);

    // Persist test data for use in tests and teardown
    const testData = {
      authUsername: TEST_USER.username,
      authEmail: TEST_USER.email,
      authPassword: TEST_USER.password,
      seededProjectId: project.id,
      cookie
    };

    fs.writeFileSync(
      TEST_DATA_PATH,
      JSON.stringify(testData, null, 2),
      'utf-8'
    );

    console.log(
      `[global-setup] Test user "${TEST_USER.username}" created, project "${project.id}" seeded.`
    );
  } catch (err) {
    // Compensate: remove the user we inserted so the DB is clean
    console.error(
      '[global-setup] Setup failed, rolling back user insertion:',
      err
    );
    const mongoose2 = await mongoose.connect(MONGO_URL);
    await mongoose2.connection.collection('users').deleteOne({
      username: TEST_USER.username
    });
    await mongoose.disconnect();
    throw err;
  }
}
