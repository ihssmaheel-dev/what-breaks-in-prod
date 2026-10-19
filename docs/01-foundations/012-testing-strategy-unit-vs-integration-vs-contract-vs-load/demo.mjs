/**
 * demo.mjs - Demonstration of Testing Strategy (Unit vs Integration vs Load)
 *
 * Demonstrates:
 * 1. The Over-Mocking Trap: A unit test mocks the database and passes with 100% green
 *    confidence, even though the underlying SQL query contains a fatal syntax error.
 * 2. The Integration Test: Running the query against a real database catches the fatal
 *    SQL bug before deployment.
 * 3. The Load Test: Simulating concurrent requests reveals connection pool exhaustion
 *    that unit and integration tests can never detect.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/012-testing-strategy-unit-vs-integration-vs-contract-vs-load/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Testing Strategy (Unit vs Integration vs Contract vs Load)');
console.log('================================================================\n');

// The flawed repository code with a subtle SQL error
class UserRepository {
  constructor(dbClient) {
    this.db = dbClient;
  }

  async findActiveUser(userId) {
    // BUG: Fatal SQL syntax error! "WHERE WHERE"
    const sql = 'SELECT id, email FROM users WHERE WHERE id = ? AND is_active = 1';
    return await this.db.query(sql, [userId]);
  }
}

// --- PART 1: THE OVER-MOCKED UNIT TEST ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The False Confidence of Over-Mocked Unit Tests');
console.log('----------------------------------------------------------------');

// Mocked database that returns fake data without executing SQL
const fakeDbMock = {
  query: async (sql, params) => {
    // The mock does not parse SQL! It just pretends everything worked.
    return [{ id: params[0], email: 'user@example.com' }];
  },
};

const repoWithMock = new UserRepository(fakeDbMock);

async function runUnitTest() {
  console.log('Running unit test with mocked database...');
  const result = await repoWithMock.findActiveUser(101);
  if (result && result[0].id === 101) {
    console.log('  ✅ UNIT TEST PASSED: User 101 found!');
    console.log('  DANGER: 100% green test passed despite a fatal SQL syntax error!\n');
  }
}

await runUnitTest();

// --- PART 2: THE REAL INTEGRATION TEST ---
console.log('----------------------------------------------------------------');
console.log('PART 2: Integration Test with Real SQL Engine Verification');
console.log('----------------------------------------------------------------');

// Simulated real SQL engine that actually parses and executes SQL
const realDbEngine = {
  query: async (sql, params) => {
    // Basic SQL validator simulating database query parser
    if (sql.includes('WHERE WHERE') || sql.includes('SELCT')) {
      throw new Error(`SQL syntax error: syntax error at or near "WHERE" in: "${sql}"`);
    }
    return [{ id: params[0], email: 'real@example.com' }];
  },
};

const repoWithRealDb = new UserRepository(realDbEngine);

async function runIntegrationTest() {
  console.log('Running integration test against real database engine...');
  try {
    await repoWithRealDb.findActiveUser(101);
    console.log('  Should not pass!');
  } catch (err) {
    console.log('  ❌ INTEGRATION TEST FAILED AS EXPECTED:');
    console.log(`     ${err.message}`);
    console.log('  PROTECTION: Caught the invalid SQL syntax before code reached production!\n');
  }
}

await runIntegrationTest();

// --- PART 3: THE CONCURRENT LOAD TEST ---
console.log('----------------------------------------------------------------');
console.log('PART 3: Load Testing (Uncovering Connection Pool Starvation)');
console.log('----------------------------------------------------------------');

// Simulated connection pool with a maximum capacity of 3 concurrent connections
class SimulatedConnectionPool {
  constructor(maxConnections = 3) {
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.queuedRequests = 0;
  }

  async acquire(requestId) {
    if (this.activeConnections >= this.maxConnections) {
      this.queuedRequests += 1;
      console.log(`  [Request ${requestId}] Pool exhausted (${this.activeConnections}/${this.maxConnections} busy). Queuing...`);
    }
    while (this.activeConnections >= this.maxConnections) {
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    if (this.queuedRequests > 0) this.queuedRequests -= 1;
    this.activeConnections += 1;
  }

  release() {
    this.activeConnections -= 1;
  }
}

const pool = new SimulatedConnectionPool(3);

async function handleRequest(requestId) {
  const start = Date.now();
  await pool.acquire(requestId);
  // Simulate 30ms database query execution
  await new Promise((resolve) => setTimeout(resolve, 30));
  pool.release();
  return Date.now() - start;
}

console.log('Simulating 9 concurrent requests against a pool limit of 3 connections:');
const requests = Array.from({ length: 9 }, (_, i) => handleRequest(i + 1));
const durations = await Promise.all(requests);

console.log('\nLoad Test Results:');
durations.forEach((d, idx) => {
  console.log(`  Request #${idx + 1}: Completed in ${d}ms ${d > 60 ? '(High latency due to connection queue!)' : '(Fast)'}`);
});

console.log('\n================================================================');
console.log('SUMMARY: Unit tests test logic. Integration tests test dependencies.');
console.log('Contract tests prevent drift. Load tests test concurrency and limits!');
console.log('================================================================');
