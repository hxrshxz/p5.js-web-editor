import mongoose from 'mongoose';
import * as fs from 'fs';
import { deleteProject } from './utils/api-helpers';
import { MONGO_URL, TEST_DATA_PATH } from './utils/constants';

export default async function globalTeardown() {
  if (!fs.existsSync(TEST_DATA_PATH)) {
    console.warn(
      '[global-teardown] No .test-data.json found — skipping cleanup.'
    );
    return;
  }

  const testData = JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf-8'));
  const { authUsername, seededProjectId, cookie } = testData;

  // Delete the seeded project via API
  try {
    await deleteProject(seededProjectId, cookie);
    console.log(`[global-teardown] Project "${seededProjectId}" deleted.`);
  } catch (err) {
    console.warn(`[global-teardown] Could not delete project via API: ${err}`);
  }

  // Connect to MongoDB and delete the test user directly
  // (there is no delete-account API endpoint)
  try {
    await mongoose.connect(MONGO_URL);
    await mongoose.connection
      .collection('users')
      .deleteOne({ username: authUsername });
    console.log(
      `[global-teardown] Test user "${authUsername}" removed from DB.`
    );
  } catch (err) {
    console.error(
      '[global-teardown] Failed to clean up user from MongoDB:',
      err
    );
  } finally {
    await mongoose.disconnect();
  }

  // Remove the test data file
  fs.unlinkSync(TEST_DATA_PATH);
}
