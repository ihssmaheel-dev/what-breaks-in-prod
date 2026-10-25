/**
 * demo.mjs - Demonstration of Idempotency Keys and Duplicate Prevention
 *
 * Demonstrates:
 * 1. The Duplicate Charge Disaster: When a network timeout occurs right after the
 *    server processes a payment, an automated client retry charges the user a second time.
 * 2. The Production Solution (Idempotency Key): The client passes a unique Idempotency-Key
 *    header. The server checks an atomic record. Retried requests return the original
 *    cached response without charging the customer twice.
 *
 * Zero external dependencies. Run with:
 *   node docs/02-api-reliability/013-idempotency-keys/demo.mjs
 */

import { createServer } from 'node:http';

console.log('================================================================');
console.log('DEMO: Idempotency Keys (Preventing Duplicate Side-Effects)');
console.log('================================================================\n');

// Simulated database & payment ledger
const bankLedger = [];
const idempotencyStore = new Map(); // key -> { status: 'IN_PROGRESS'|'COMPLETED', response: {...} }

let timeoutTriggered = { broken: false, fixed: false };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Read request body
  let bodyStr = '';
  for await (const chunk of req) bodyStr += chunk;
  const payload = bodyStr ? JSON.parse(bodyStr) : {};

  // --- ENDPOINT 1: BROKEN (NON-IDEMPOTENT) ---
  if (pathname === '/api/broken/checkout') {
    // Charge user immediately on every request
    const chargeId = `ch_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    bankLedger.push({ id: chargeId, amount: payload.amount, user: payload.user });

    // Simulate slow network on first attempt causing client timeout
    if (!timeoutTriggered.broken) {
      timeoutTriggered.broken = true;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'success', chargeId, amount: payload.amount }));
  }

  // --- ENDPOINT 2: FIXED (IDEMPOTENCY KEY ENFORCED) ---
  if (pathname === '/api/fixed/checkout') {
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Missing required Idempotency-Key header' }));
    }

    // Step 1: Check if key exists in store
    const existing = idempotencyStore.get(idempotencyKey);

    if (existing) {
      if (existing.status === 'IN_PROGRESS') {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: '409 Conflict: Request currently processing' }));
      }

      // Return the cached response without charging the card again!
      res.writeHead(existing.response.status, {
        'Content-Type': 'application/json',
        'X-Cache-Hit': 'true',
      });
      return res.end(JSON.stringify(existing.response.body));
    }

    // Step 2: Mark key as IN_PROGRESS
    idempotencyStore.set(idempotencyKey, { status: 'IN_PROGRESS' });

    // Step 3: Execute real payment side-effect
    const chargeId = `ch_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    bankLedger.push({ id: chargeId, amount: payload.amount, user: payload.user });

    const responsePayload = {
      status: 'success',
      chargeId,
      amount: payload.amount,
      message: 'Charge completed successfully',
    };

    // Step 4: Save completed response in idempotency store
    idempotencyStore.set(idempotencyKey, {
      status: 'COMPLETED',
      response: {
        status: 200,
        body: responsePayload,
      },
    });

    // Simulate slow network on first attempt causing client timeout
    if (!timeoutTriggered.fixed) {
      timeoutTriggered.fixed = true;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(responsePayload));
  }

  res.writeHead(404);
  res.end();
});

server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // --- PART 1: THE NON-IDEMPOTENT FAILURE ---
    console.log('----------------------------------------------------------------');
    console.log('PART 1: The Broken Endpoint (Client Retry Creates Duplicate Charges)');
    console.log('----------------------------------------------------------------');

    console.log('Customer places $50 order (Attempt 1)...');
    try {
      // Client has an aggressive 80ms network timeout
      await fetch(`${baseUrl}/api/broken/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: 'alice', amount: 50 }),
        signal: AbortSignal.timeout(80),
      });
    } catch {
      console.log('  ⚠️  Network timeout! Client waited 80ms and timed out.');
      console.log('  (Meanwhile, server finished processing and charged the card!)');
    }

    console.log('\nMobile app detects network error and retries (Attempt 2)...');
    const retryRes = await fetch(`${baseUrl}/api/broken/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: 'alice', amount: 50 }),
    });
    const retryData = await retryRes.json();
    console.log('  Attempt 2 succeeded:', retryData);

    console.log('\nBANK LEDGER STATE (Broken Endpoint):');
    console.log(`  Total charges created: ${bankLedger.length}`);
    bankLedger.forEach((entry, idx) => {
      console.log(`  Charge #${idx + 1}: ID ${entry.id} | Amount: $${entry.amount}`);
    });
    console.log('  DISASTER CONFIRMED: Alice was charged $100.00 for one $50.00 order!\n');

    // Reset ledger for Part 2
    bankLedger.length = 0;

    // --- PART 2: THE IDEMPOTENT PRODUCTION SOLUTION ---
    console.log('----------------------------------------------------------------');
    console.log('PART 2: The Production Fix (Idempotency-Key Header)');
    console.log('----------------------------------------------------------------');

    const clientGeneratedKey = 'order-uuid-9921-abc-123';
    console.log(`Client generates unique key: "${clientGeneratedKey}"`);

    console.log('\nCustomer places $50 order with Idempotency-Key (Attempt 1)...');
    try {
      await fetch(`${baseUrl}/api/fixed/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': clientGeneratedKey,
        },
        body: JSON.stringify({ user: 'alice', amount: 50 }),
        signal: AbortSignal.timeout(80),
      });
    } catch {
      console.log('  ⚠️  Network timeout! Client timed out after 80ms.');
      console.log('  (Server completed processing and saved response in idempotency cache!)');
    }

    console.log('\nMobile app retries with the SAME Idempotency-Key (Attempt 2)...');
    const idempotentRetryRes = await fetch(`${baseUrl}/api/fixed/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': clientGeneratedKey,
      },
      body: JSON.stringify({ user: 'alice', amount: 50 }),
    });

    const isCacheHit = idempotentRetryRes.headers.get('x-cache-hit') === 'true';
    const idempotentData = await idempotentRetryRes.json();
    console.log(`  Attempt 2 Response:`, idempotentData);
    console.log(`  Was response served from idempotency cache? ${isCacheHit}`);

    console.log('\nBANK LEDGER STATE (Idempotent Endpoint):');
    console.log(`  Total charges created: ${bankLedger.length}`);
    bankLedger.forEach((entry, idx) => {
      console.log(`  Charge #${idx + 1}: ID ${entry.id} | Amount: $${entry.amount}`);
    });
    console.log('  PROTECTION CONFIRMED: Exactly 1 charge created! Zero duplicate billing!\n');

    console.log('================================================================');
    console.log('SUMMARY: Never build state-changing POST endpoints without idempotency.');
    console.log('Always pair automated retries with unique client-side Idempotency Keys!');
    console.log('================================================================');
  } catch (err) {
    console.error('Demo error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
