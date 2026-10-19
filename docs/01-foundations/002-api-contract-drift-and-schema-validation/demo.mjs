/**
 * demo.mjs - Demonstration of API Contract Drift and Schema Validation
 *
 * Demonstrates how unvalidated API boundaries lead to silent data corruption (NaN values),
 * runtime TypeError crashes, and how runtime schema validation prevents it.
 *
 * Zero dependencies. Run with:
 *   node docs/01-foundations/002-api-contract-drift-and-schema-validation/demo.mjs
 */

import http from 'node:http';

// Simulated in-memory database
const database = [];

// Lightweight zero-dependency runtime schema validator (demonstrates Zod/Joi principles)
function validateUserPayload(body) {
  const errors = {};

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: { _global: 'Payload must be a valid JSON object' } };
  }

  // 1. Validate 'name'
  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.name = 'Expected string, received ' + typeof body.name;
  }

  // 2. Validate 'age'
  if (typeof body.age !== 'number' || isNaN(body.age) || body.age <= 0) {
    errors.age = 'Expected positive integer number, received ' + (typeof body.age === 'number' ? 'NaN' : typeof body.age);
  }

  // 3. Validate 'email'
  if (typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.email = 'Expected valid email address string';
  }

  // 4. Validate 'address' with backward compatibility (supports string OR object)
  if (typeof body.address === 'string') {
    // Legacy format supported
  } else if (typeof body.address === 'object' && body.address !== null) {
    if (typeof body.address.street !== 'string' || typeof body.address.city !== 'string') {
      errors.address = "Expected address object to contain 'street' and 'city' strings";
    }
  } else {
    errors.address = "Expected address to be a string or an object with 'street' and 'city'";
  }

  const isValid = Object.keys(errors).length === 0;
  return { valid: isValid, errors };
}

// Create test server demonstrating broken vs fixed endpoints
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Helper to parse JSON body
  let rawBody = '';
  for await (const chunk of req) rawBody += chunk;
  let body = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Malformed JSON' }));
  }

  // --- BROKEN ENDPOINT: Blind trust, no validation ---
  if (url.pathname === '/api/broken/users') {
    // Problem 1: Blind arithmetic on unverified types produces NaN
    const birthYear = 2026 - body.age;

    // Problem 2: Assuming address is a string without checking type
    let cleanAddress;
    try {
      cleanAddress = body.address.trim();
    } catch (e) {
      cleanAddress = 'ERROR_CRASHED';
    }

    const record = {
      id: database.length + 1,
      name: body.name,
      birthYear,
      address: cleanAddress,
      rawAge: body.age,
    };

    database.push(record);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'saved', record }));
  }

  // --- FIXED ENDPOINT: Boundary validation with RFC 7807 error format ---
  if (url.pathname === '/api/fixed/users') {
    const check = validateUserPayload(body);

    if (!check.valid) {
      res.writeHead(422, { 'Content-Type': 'application/problem+json' });
      return res.end(
        JSON.stringify({
          type: 'https://api.example.com/errors/validation-failed',
          title: 'Unprocessable Entity',
          status: 422,
          detail: 'Incoming payload violates the API schema contract.',
          errors: check.errors,
          instance: req.url,
        })
      );
    }

    // Safely normalize address (backward compatibility)
    const normalizedAddress =
      typeof body.address === 'string'
        ? body.address.trim()
        : `${body.address.street.trim()}, ${body.address.city.trim()}`;

    const cleanRecord = {
      id: database.length + 1,
      name: body.name.trim(),
      birthYear: 2026 - body.age,
      address: normalizedAddress,
      email: body.email.trim(),
    };

    database.push(cleanRecord);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'saved', record: cleanRecord }));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

async function runDemo() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log('================================================================');
  console.log('DEMO: API Contract Drift and Schema Validation in Production');
  console.log('================================================================\n');

  // Payload representing contract drift:
  // - 'age' is sent as string "twenty" instead of integer
  // - 'address' is missing or not a string
  // - 'email' is completely omitted
  const driftedPayload = {
    name: 'Alex Developer',
    age: 'twenty', // Type drift!
    address: null, // Shape drift!
  };

  // --- TEST 1: THE BROKEN SCENARIO ---
  console.log('----------------------------------------------------------------');
  console.log('PART 1: The Broken Scenario (Blind Trust Without Validation)');
  console.log('----------------------------------------------------------------');
  console.log('-> Sending drifted payload to /api/broken/users:');
  console.log('   Payload:', JSON.stringify(driftedPayload));

  const brokenRes = await fetch(`${baseUrl}/api/broken/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driftedPayload),
  });

  const brokenData = await brokenRes.json();
  console.log(`<- Response Status: ${brokenRes.status} (Server accepted corrupted data!)`);
  console.log('<- Stored Database Record:');
  console.log('  ', brokenData.record);
  console.log('   Notice: birthYear is NaN, address is crashed. Bad data has corrupted storage!\n');

  // --- TEST 2: THE FIXED SCENARIO ---
  console.log('----------------------------------------------------------------');
  console.log('PART 2: The Fixed Scenario (Boundary Runtime Schema Validation)');
  console.log('----------------------------------------------------------------');
  console.log('-> Sending the same drifted payload to /api/fixed/users:');

  const fixedRes = await fetch(`${baseUrl}/api/fixed/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driftedPayload),
  });

  const fixedData = await fixedRes.json();
  console.log(`<- Response Status: ${fixedRes.status} Unprocessable Entity (BLOCKED AT DOOR)`);
  console.log('<- Structured Validation Errors:');
  console.log('  ', JSON.stringify(fixedData.errors, null, 2));
  console.log('   Notice: The database was NOT touched. Client received actionable field errors.\n');

  // --- TEST 3: VALID PAYLOAD WITH BACKWARD COMPATIBILITY ---
  console.log('----------------------------------------------------------------');
  console.log('PART 3: Clean Payload With Backward Compatible Address');
  console.log('----------------------------------------------------------------');
  const validPayload = {
    name: 'Sarah Connor',
    age: 28,
    email: 'sarah@example.com',
    address: { street: '100 Cyberdyne Way', city: 'Los Angeles' },
  };

  console.log('-> Sending valid payload with modern object address format:');
  const successRes = await fetch(`${baseUrl}/api/fixed/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload),
  });

  const successData = await successRes.json();
  console.log(`<- Response Status: ${successRes.status} Created`);
  console.log('<- Stored Clean Record:');
  console.log('  ', successData.record);
  console.log('   Notice: Data is clean, computed safely, and types are 100% verified.\n');

  console.log('================================================================');
  console.log('Demo completed successfully. Clean shutdown.');
  console.log('================================================================');

  server.close();
}

runDemo().catch((err) => {
  console.error('Demo encountered error:', err);
  server.close();
  process.exit(1);
});
