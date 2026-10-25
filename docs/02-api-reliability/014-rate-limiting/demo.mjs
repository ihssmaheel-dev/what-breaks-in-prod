/**
 * demo.mjs - Demonstration of Rate Limiting and Token Bucket Algorithm
 *
 * Demonstrates:
 * 1. The Runaway Script Problem: An unthrottled endpoint lets a single client flood
 *    the server with 15 requests in 100ms, consuming all worker resources.
 * 2. The Production Solution (Token Bucket Rate Limiter): Enforces burst limits (capacity: 5)
 *    and steady refill rates (2 tokens/second). Rejects excess calls with 429 Too Many Requests
 *    and a Retry-After header.
 *
 * Zero external dependencies. Run with:
 *   node docs/02-api-reliability/014-rate-limiting/demo.mjs
 */

import { createServer } from 'node:http';

console.log('================================================================');
console.log('DEMO: Rate Limiting (Token Bucket Algorithm)');
console.log('================================================================\n');

// In-memory Token Bucket implementation
class TokenBucket {
  constructor(capacity, refillRatePerSecond) {
    this.capacity = capacity; // Maximum tokens bucket can hold (burst limit)
    this.refillRate = refillRatePerSecond; // Tokens added per second
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  tryConsume() {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return { allowed: true, remaining: Math.floor(this.tokens) };
    }

    // Calculate how many seconds until next token is available
    const missingTokens = 1 - this.tokens;
    const retryAfterSeconds = Math.ceil(missingTokens / this.refillRate);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }
}

// Map of client identifier -> TokenBucket
const rateLimiters = new Map();

function getLimiter(clientId) {
  if (!rateLimiters.has(clientId)) {
    // Capacity 5 tokens, refills 2 tokens per second
    rateLimiters.set(clientId, new TokenBucket(5, 2));
  }
  return rateLimiters.get(clientId);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Endpoint 1: Broken (No rate limiting)
  if (pathname === '/api/broken/search') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', message: 'Query executed' }));
  }

  // Endpoint 2: Fixed (Token bucket rate limited)
  if (pathname === '/api/fixed/search') {
    const clientId = req.headers['x-api-key'] || 'anonymous';
    const limiter = getLimiter(clientId);
    const result = limiter.tryConsume();

    if (!result.allowed) {
      res.writeHead(429, {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
      });
      return res.end(
        JSON.stringify({
          error: '429 Too Many Requests',
          message: `Rate limit exceeded. Please retry in ${result.retryAfterSeconds} seconds.`,
        })
      );
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': String(result.remaining),
    });
    return res.end(JSON.stringify({ status: 'ok', remainingTokens: result.remaining }));
  }

  res.writeHead(404);
  res.end();
});

server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // --- PART 1: THE UNTHROTTLED RUNAWAY SCRIPT ---
    console.log('----------------------------------------------------------------');
    console.log('PART 1: The Broken Endpoint (No Rate Limiting)');
    console.log('----------------------------------------------------------------');
    console.log('Simulating a runaway client script firing 10 rapid requests in 50ms...');

    let successfulBrokenCalls = 0;
    for (let i = 1; i <= 10; i++) {
      const res = await fetch(`${baseUrl}/api/broken/search`);
      if (res.status === 200) successfulBrokenCalls++;
    }

    console.log(`Results: ${successfulBrokenCalls}/10 requests hit the backend without restriction!`);
    console.log('DANGER: A single client can exhaust database connections and crash the API for all users.\n');

    // --- PART 2: THE TOKEN BUCKET RATE LIMITER ---
    console.log('----------------------------------------------------------------');
    console.log('PART 2: The Production Fix (Token Bucket Rate Limiter)');
    console.log('----------------------------------------------------------------');
    console.log('Configuration: Capacity = 5 tokens, Refill rate = 2 tokens/sec.');
    console.log('Sending 8 rapid requests from client "api-key-customer-1":\n');

    for (let i = 1; i <= 8; i++) {
      const res = await fetch(`${baseUrl}/api/fixed/search`, {
        headers: { 'x-api-key': 'api-key-customer-1' },
      });
      const data = await res.json();

      if (res.status === 200) {
        console.log(`  Request #${i}: 200 OK (Allowed | Remaining tokens: ${data.remainingTokens})`);
      } else if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        console.log(`  Request #${i}: 429 Too Many Requests! (Blocked | Retry-After: ${retryAfter}s)`);
      }
    }

    console.log('\n[Client pauses for 1.2 seconds to allow tokens to refill...]');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    console.log('Sending Request #9 after pause:');
    const delayedRes = await fetch(`${baseUrl}/api/fixed/search`, {
      headers: { 'x-api-key': 'api-key-customer-1' },
    });
    const delayedData = await delayedRes.json();
    console.log(`  Request #9: ${delayedRes.status} OK (Allowed | Remaining tokens: ${delayedData.remainingTokens})`);

    console.log('\n================================================================');
    console.log('SUMMARY: Protect every public API with rate limiting.');
    console.log('Use Token Bucket to allow short bursts while enforcing safe steady rates!');
    console.log('================================================================');
  } catch (err) {
    console.error('Demo error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
