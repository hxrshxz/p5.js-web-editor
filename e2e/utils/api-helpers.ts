import { BASE_URL } from './constants';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  id?: string;
}

export interface TestProject {
  id: string;
  name: string;
}

/**
 * Login via the API and return the raw Set-Cookie header string.
 */
export async function loginUser(
  user: Pick<TestUser, 'email' | 'password'>
): Promise<string> {
  // passport-local is configured with usernameField: 'email'
  const res = await fetch(`${BASE_URL}/editor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password })
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  }
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No session cookie returned from login');
  }
  return setCookie;
}

/**
 * Create a project via the API. Requires a session cookie.
 */
export async function createProject(
  name: string,
  cookie: string
): Promise<TestProject> {
  const res = await fetch(`${BASE_URL}/editor/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie
    },
    body: JSON.stringify({ name })
  });
  if (!res.ok) {
    throw new Error(`Create project failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return { id: data.id ?? data._id, name: data.name };
}

/**
 * Delete a project via the API. Requires a session cookie.
 */
export async function deleteProject(
  projectId: string,
  cookie: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/editor/projects/${projectId}`, {
    method: 'DELETE',
    headers: { Cookie: cookie }
  });
  if (!res.ok) {
    throw new Error(`Delete project failed: ${res.status}`);
  }
}
