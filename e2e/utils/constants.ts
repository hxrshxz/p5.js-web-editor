import * as path from 'path';

export const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:8000';
// Port 27018 matches docker-compose.e2e.yml which maps mongo-e2e:27017 → host:27018
// (avoids conflicts with a locally running MongoDB on 27017)
export const MONGO_URL =
  process.env.MONGO_URL ?? 'mongodb://localhost:27018/p5js-e2e-test';
export const TEST_DATA_PATH = path.join(__dirname, '..', '.test-data.json');
