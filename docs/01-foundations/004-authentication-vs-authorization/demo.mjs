/**
 * demo.mjs - Demonstration of Authentication (AuthN) vs Authorization (AuthZ)
 *
 * Demonstrates:
 * 1. Authentication: Proving user identity with an auth token.
 * 2. The Broken Endpoint (BOLA / IDOR): Valid authentication, but missing object-level
 *    authorization checks allows one user to read another user's private data.
 * 3. The Fixed Endpoint: Proper object-level authorization enforcing resource ownership,
 *    blocking unauthorized access with 403 Forbidden.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/004-authentication-vs-authorization/demo.mjs
 */

import { createServer } from 'node:http';

console.log('================================================================');
console.log('DEMO: Authentication (AuthN) vs Authorization (AuthZ)');
console.log('================================================================\n');

// 1. In-memory database simulation
const USERS = {
  'token-alice-123': { id: 'usr_alice', name: 'Alice Smith', role: 'patient' },
  'token-bob-456': { id: 'usr_bob', name: 'Bob Jones', role: 'patient' },
};

const MEDICAL_RECORDS = [
  {
    id: 101,
    patientId: 'usr_alice',
    patientName: 'Alice Smith',
    diagnosis: 'Routine checkup: Blood pressure normal (118/76).',
    confidential: false,
  },
  {
    id: 102,
    patientId: 'usr_bob',
    patientName: 'Bob Jones',
    diagnosis: 'Confidential: Patient prescribed antiviral medication.',
    confidential: true,
  },
];

// Helper to authenticate user from Authorization header
function authenticate(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return USERS[token] || null;
}

// 2. Simulated HTTP Server
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const recordId = parseInt(url.searchParams.get('recordId'), 10);
  const user = authenticate(req.headers.authorization);

  // Endpoint 1: Broken (Checks authentication, forgets authorization)
  if (pathname === '/api/broken/records') {
    // Step 1: Authentication Check (AuthN)
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: '401 Unauthorized: Please log in first' }));
    }

    // Step 2: Query database for the record
    // BUG: Missing object-level authorization!
    // The server never checks if user.id matches record.patientId!
    const record = MEDICAL_RECORDS.find((r) => r.id === recordId);

    if (!record) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Record not found' }));
    }

    // Leaks private data to any logged-in user!
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'success', data: record }));
  }

  // Endpoint 2: Fixed (Checks authentication AND object-level authorization)
  if (pathname === '/api/fixed/records') {
    // Step 1: Authentication Check (AuthN)
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: '401 Unauthorized: Please log in first' }));
    }

    // Step 2: Fetch record with ownership constraint (AuthZ)
    const record = MEDICAL_RECORDS.find((r) => r.id === recordId);

    if (!record) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Record not found' }));
    }

    // Step 3: Authorization Check (Does this user own this record?)
    if (record.patientId !== user.id && user.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: '403 Forbidden: You do not have permission to view this record.',
          reason: `User ${user.id} is not authorized to access record belonging to ${record.patientId}`,
        })
      );
    }

    // Safe response: user is verified and authorized
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'success', data: record }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Run client test suite against the local server
server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(path, token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, { headers });
    const data = await res.json();
    return { status: res.status, body: data };
  }

  try {
    // --- TEST 1: UNLOGGED IN USER (AUTHN FAILURE) ---
    console.log('----------------------------------------------------------------');
    console.log('TEST 1: Request with no token (Authentication Failure)');
    console.log('----------------------------------------------------------------');
    const unauthRes = await request('/api/broken/records?recordId=101', null);
    console.log(`HTTP Status: ${unauthRes.status}`);
    console.log(`Response:    ${JSON.stringify(unauthRes.body)}`);
    console.log('Result:      Rejected. Authentication correctly stopped the anonymous caller.\n');

    // --- TEST 2: ALICE ACCESSING HER OWN RECORD ---
    console.log('----------------------------------------------------------------');
    console.log("TEST 2: Alice accessing her own record #101 (Legitimate Request)");
    console.log('----------------------------------------------------------------');
    const aliceLegitRes = await request('/api/broken/records?recordId=101', 'token-alice-123');
    console.log(`HTTP Status: ${aliceLegitRes.status}`);
    console.log(`Patient:     ${aliceLegitRes.body.data.patientName}`);
    console.log(`Diagnosis:   ${aliceLegitRes.body.data.diagnosis}`);
    console.log('Result:      Success. Alice viewed her own medical report.\n');

    // --- TEST 3: THE BROKEN ENDPOINT (IDOR / BOLA EXPLOIT) ---
    console.log('----------------------------------------------------------------');
    console.log("TEST 3: Alice requests Bob's record #102 on BROKEN endpoint (IDOR / BOLA)");
    console.log('----------------------------------------------------------------');
    console.log('Context: Alice is logged in with her valid token.');
    console.log('She simply changes query param: recordId=101 -> recordId=102');
    const exploitRes = await request('/api/broken/records?recordId=102', 'token-alice-123');
    console.log(`HTTP Status: ${exploitRes.status}`);
    console.log(`Leaked Data: ${JSON.stringify(exploitRes.body.data)}`);
    console.log('VULNERABILITY CONFIRMED:');
    console.log("  AuthN succeeded (Alice is logged in), but AuthZ was missing.");
    console.log("  Alice just read Bob's confidential medical diagnosis!\n");

    // --- TEST 4: THE FIXED ENDPOINT (AUTHZ ENFORCED) ---
    console.log('----------------------------------------------------------------');
    console.log("TEST 4: Alice requests Bob's record #102 on FIXED endpoint (AuthZ Enforced)");
    console.log('----------------------------------------------------------------');
    const fixedRes = await request('/api/fixed/records?recordId=102', 'token-alice-123');
    console.log(`HTTP Status: ${fixedRes.status}`);
    console.log(`Response:    ${JSON.stringify(fixedRes.body)}`);
    console.log('PROTECTION CONFIRMED:');
    console.log('  The server authenticated Alice, checked object ownership,');
    console.log("  and blocked access with 403 Forbidden. Bob's private data is safe!\n");

    console.log('================================================================');
    console.log('SUMMARY: AuthN proves WHO you are. AuthZ decides WHAT you can touch.');
    console.log('Never query records by ID without scoping to the authenticated owner!');
    console.log('================================================================');
  } catch (err) {
    console.error('Demo encountered an unexpected error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
