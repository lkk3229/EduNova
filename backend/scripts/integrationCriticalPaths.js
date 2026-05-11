const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const tests = [
  {
    name: 'health endpoint',
    request: { method: 'GET', path: '/api/health' },
    assert: (res, body) => {
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!body || !body.database || !body.database.mode) {
        throw new Error('Health response missing database connectivity payload');
      }
    },
  },
  {
    name: 'readiness endpoint',
    request: { method: 'GET', path: '/api/ready' },
    assert: (res, body) => {
      if (![200, 503].includes(res.status)) {
        throw new Error(`Expected readiness status 200/503, got ${res.status}`);
      }
      if (!body || !body.database || !body.database.mode) {
        throw new Error('Readiness response missing database payload');
      }
    },
  },
  {
    name: 'courses list route mounted',
    request: { method: 'GET', path: '/api/courses' },
    assert: (res) => {
      if (res.status === 404) throw new Error('Expected non-404 for /api/courses');
    },
  },
  {
    name: 'auth login route mounted',
    request: {
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'nobody@example.com', password: 'invalid-password' },
    },
    assert: (res) => {
      if (res.status === 404) throw new Error('Expected non-404 for /api/auth/login');
      if (![400, 401, 500].includes(res.status)) {
        throw new Error(`Unexpected status for login route contract: ${res.status}`);
      }
    },
  },
  {
    name: 'course enroll auth guard',
    request: { method: 'POST', path: '/api/courses/000000000000000000000000/enroll' },
    assert: (res) => {
      if (res.status !== 401) throw new Error(`Expected 401 unauthorized, got ${res.status}`);
    },
  },
  {
    name: 'payment verify auth guard',
    request: { method: 'POST', path: '/api/payments/verify', body: {} },
    assert: (res) => {
      if (res.status !== 401) throw new Error(`Expected 401 unauthorized, got ${res.status}`);
    },
  },
  {
    name: 'upload auth guard',
    request: { method: 'POST', path: '/api/uploads/image' },
    assert: (res) => {
      if (res.status !== 401) throw new Error(`Expected 401 unauthorized, got ${res.status}`);
    },
  },
];

const request = async ({ method, path, body }) => {
  const options = {
    method,
    headers: {
      Accept: 'application/json',
    },
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (_) {
      payload = text;
    }
  }

  return { status: response.status, body: payload };
};

const run = async () => {
  let passed = 0;
  for (const test of tests) {
    try {
      const res = await request(test.request);
      test.assert(res, res.body);
      console.log(`✓ ${test.name}`);
      passed += 1;
    } catch (error) {
      console.error(`✗ ${test.name}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`Critical path integration checks passed: ${passed}/${tests.length}`);
};

run().catch((error) => {
  console.error(`Critical path integration checks failed: ${error.message}`);
  process.exit(1);
});
