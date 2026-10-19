/**
 * demo.mjs - Demonstration of HTTP Status Codes & Error Semantics
 *
 * Demonstrates why returning HTTP 200 OK for errors blinds observability
 * and breaks client retry logic, and how semantic status codes fix it.
 *
 * Zero dependencies. Run with:
 *   node docs/01-foundations/001-http-status-codes-and-error-semantics/demo.mjs
 */

import http from 'node:http';

// Simulated observability telemetry store
const telemetry = {
  success_2xx: 0,
  client_error_4xx: 0,
  server_error_5xx: 0,
};

function resetTelemetry() {
  telemetry.success_2xx = 0;
  telemetry.client_error_4xx = 0;
  telemetry.server_error_5xx = 0;
}

// 1. Create a local test server handling both broken and fixed endpoints
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Simulating the BROKEN endpoint (always returns 200 OK)
  if (url.pathname === '/api/broken/checkout') {
    // Simulated failure: Missing required credit card details
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        error: 'Missing required payment details',
        code: 'ERR_INVALID_PAYMENT',
      })
    );
    return;
  }

  // Simulating the FIXED endpoint (semantic 422 Unprocessable Entity)
  if (url.pathname === '/api/fixed/checkout') {
    // RFC 7807 Problem Details
    res.writeHead(422, { 'Content-Type': 'application/problem+json' });
    res.end(
      JSON.stringify({
        type: 'https://api.example.com/errors/validation-failed',
        title: 'Unprocessable Entity',
        status: 422,
        detail: 'The field cardNumber is mandatory.',
        instance: req.url,
      })
    );
    return;
  }

  // Simulating an upstream service crash (502 Bad Gateway)
  if (url.pathname === '/api/fixed/upstream-crash') {
    res.writeHead(502, { 'Content-Type': 'application/problem+json' });
    res.end(
      JSON.stringify({
        type: 'https://api.example.com/errors/bad-gateway',
        title: 'Bad Gateway',
        status: 502,
        detail: 'Upstream banking gateway closed TCP connection abruptly.',
        instance: req.url,
      })
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Helper to record gateway / monitoring metrics based purely on status code
function recordTelemetry(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    telemetry.success_2xx++;
  } else if (statusCode >= 400 && statusCode < 500) {
    telemetry.client_error_4xx++;
  } else if (statusCode >= 500 && statusCode < 600) {
    telemetry.server_error_5xx++;
  }
}

async function runDemonstration() {
  // Start server on dynamic port chosen by OS
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log('================================================================');
  console.log('DEMO: HTTP Status Codes and Error Semantics in Production');
  console.log('================================================================\n');

  // --- PART 1: THE BROKEN SCENARIO (200 OK with Error Payload) ---
  console.log('----------------------------------------------------------------');
  console.log('PART 1: The Broken Scenario (Returning 200 OK for Errors)');
  console.log('----------------------------------------------------------------');
  resetTelemetry();

  console.log('-> Client makes a checkout request with invalid payment data...');
  const brokenRes = await fetch(`${baseUrl}/api/broken/checkout`, { method: 'POST' });
  recordTelemetry(brokenRes.status);

  console.log(`<- Received HTTP Header Status: ${brokenRes.status}`);
  console.log(`<- Evaluated response.ok:       ${brokenRes.ok}`);

  const brokenBody = await brokenRes.json();
  console.log('<- Received JSON Body:         ', brokenBody);

  console.log('\n[Observability Metrics for Part 1]');
  console.log(`  2xx Successes:    ${telemetry.success_2xx} (MONITORING BLIND: Error logged as successful!)`);
  console.log(`  4xx Client Errors: ${telemetry.client_error_4xx}`);
  console.log(`  5xx Server Errors: ${telemetry.server_error_5xx}`);
  console.log('  Impact: Alert thresholds never fire; customer support gets flooded.\n');

  // --- PART 2: THE FIXED SCENARIO (Semantic 422 Client Error) ---
  console.log('----------------------------------------------------------------');
  console.log('PART 2: The Fixed Scenario (Semantic 422 Unprocessable Entity)');
  console.log('----------------------------------------------------------------');
  resetTelemetry();

  console.log('-> Client makes the same invalid checkout request...');
  const fixedRes = await fetch(`${baseUrl}/api/fixed/checkout`, { method: 'POST' });
  recordTelemetry(fixedRes.status);

  console.log(`<- Received HTTP Header Status: ${fixedRes.status}`);
  console.log(`<- Evaluated response.ok:       ${fixedRes.ok}`);

  const fixedBody = await fixedRes.json();
  console.log('<- Received Problem RFC 7807:  ', fixedBody);

  console.log('\n[Observability Metrics for Part 2]');
  console.log(`  2xx Successes:    ${telemetry.success_2xx}`);
  console.log(`  4xx Client Errors: ${telemetry.client_error_4xx} (CORRECT: Gateway knows client submitted invalid data)`);
  console.log(`  5xx Server Errors: ${telemetry.server_error_5xx}`);
  console.log('  Action: Client SDK displays form error; automated retries are suppressed.\n');

  // --- PART 3: UPSTREAM CRASH (Semantic 502 Bad Gateway) ---
  console.log('----------------------------------------------------------------');
  console.log('PART 3: Upstream Failure (Semantic 502 Bad Gateway)');
  console.log('----------------------------------------------------------------');
  resetTelemetry();

  console.log('-> Client contacts backend when banking gateway drops connection...');
  const crashRes = await fetch(`${baseUrl}/api/fixed/upstream-crash`, { method: 'POST' });
  recordTelemetry(crashRes.status);

  console.log(`<- Received HTTP Header Status: ${crashRes.status}`);
  console.log(`<- Evaluated response.ok:       ${crashRes.ok}`);

  const crashBody = await crashRes.json();
  console.log('<- Received Problem RFC 7807:  ', crashBody);

  console.log('\n[Observability Metrics for Part 3]');
  console.log(`  2xx Successes:    ${telemetry.success_2xx}`);
  console.log(`  4xx Client Errors: ${telemetry.client_error_4xx}`);
  console.log(`  5xx Server Errors: ${telemetry.server_error_5xx} (CORRECT: Alerts trigger, circuit breaker trips)`);
  console.log('  Action: Client SDK triggers exponential retry with jitter.\n');

  console.log('================================================================');
  console.log('Demo completed successfully. Clean shutdown.');
  console.log('================================================================');

  // Clean shutdown
  server.close();
}

runDemonstration().catch((err) => {
  console.error('Demo encountered error:', err);
  server.close();
  process.exit(1);
});
