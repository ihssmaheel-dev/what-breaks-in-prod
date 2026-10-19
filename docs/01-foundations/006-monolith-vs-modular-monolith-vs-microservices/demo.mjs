/**
 * demo.mjs - Demonstration of Monolith vs Microservices Failure Modes
 *
 * Demonstrates:
 * 1. Microservices Chain Failure: 3 independent network hops, cascading latency,
 *    and a partial failure state where a credit card is charged but the order fails.
 * 2. Modular Monolith Execution: In-memory function calls, near-zero latency,
 *    and atomic rollback when a failure occurs.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/006-monolith-vs-modular-monolith-vs-microservices/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Monolith vs Modular Monolith vs Microservices');
console.log('================================================================\n');

// Utility to simulate network delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- PART 1: THE DISTRIBUTED MICROSERVICES FAILURE ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Microservices Cascade and Partial Failure Problem');
console.log('----------------------------------------------------------------');

// Simulated separate microservices talking over network
class MicroserviceNetwork {
  constructor() {
    this.chargedAccounts = new Map();
    this.createdOrders = [];
  }

  // Service 1: Payment Service
  async callPaymentService(userId, amount) {
    await sleep(40); // 40ms network round-trip
    this.chargedAccounts.set(userId, amount);
    return { status: 200, transactionId: 'tx_99182' };
  }

  // Service 2: Inventory Service
  async callInventoryService(itemId) {
    await sleep(35); // 35ms network round-trip
    return { status: 200, reserved: true };
  }

  // Service 3: Notification Service (Unhealthy / Network Timeout)
  async callNotificationService(userId) {
    await sleep(150); // High latency network delay
    throw new Error('504 Gateway Timeout: Notification service unreachable');
  }

  // Orchestrated checkout flow
  async checkout(userId, itemId, amount) {
    const startTime = Date.now();
    console.log('[Microservices Checkout Started]');

    try {
      // Hop 1: Call Payment Service
      console.log('  -> Calling Payment Service over HTTP...');
      const payment = await this.callPaymentService(userId, amount);
      console.log(`     Payment charged: $${amount} (Tx: ${payment.transactionId})`);

      // Hop 2: Call Inventory Service
      console.log('  -> Calling Inventory Service over HTTP...');
      await this.callInventoryService(itemId);
      console.log('     Inventory reserved.');

      // Hop 3: Call Notification Service
      console.log('  -> Calling Notification Service over HTTP...');
      await this.callNotificationService(userId);

      // If all hops succeed:
      this.createdOrders.push({ userId, itemId, amount });
      console.log('     Order completed successfully.');
    } catch (err) {
      const duration = Date.now() - startTime;
      console.log(`\n❌ MICROSERVICES REQUEST FAILED after ${duration}ms!`);
      console.log(`   Error: ${err.message}`);
      console.log('   DISASTER STATE:');
      console.log(`   - Was user charged? ${this.chargedAccounts.has(userId)} ($${this.chargedAccounts.get(userId)})`);
      console.log(`   - Was order record created? ${this.createdOrders.length > 0}`);
      console.log('   - Result: Inconsistent distributed state! Customer was charged but received no order!\n');
    }
  }
}

const network = new MicroserviceNetwork();
await network.checkout('usr_carol', 'item_macbook', 1999);

// --- PART 2: THE MODULAR MONOLITH IN-PROCESS EXECUTION ---
console.log('----------------------------------------------------------------');
console.log('PART 2: Modular Monolith In-Memory Execution with Atomic Rollback');
console.log('----------------------------------------------------------------');

// In a Modular Monolith, modules are cleanly separated in code,
// but they run inside the same memory space and share an ACID transaction.
class ModularMonolithApp {
  constructor() {
    this.database = {
      charges: new Map(),
      orders: [],
    };
  }

  async checkoutWithTransaction(userId, itemId, amount, simulateError = true) {
    const startTime = Date.now();
    console.log('[Modular Monolith Checkout Started]');

    // Simulated database transaction
    const transaction = {
      pendingCharges: new Map(),
      pendingOrders: [],
    };

    try {
      // Step 1: In-memory call to Payment Module (0ms network delay)
      console.log('  -> Calling PaymentModule.charge() in-process...');
      transaction.pendingCharges.set(userId, amount);
      console.log(`     Payment staged: $${amount}`);

      // Step 2: In-memory call to Inventory Module (0ms network delay)
      console.log('  -> Calling InventoryModule.reserve() in-process...');
      console.log('     Inventory reserved.');

      // Step 3: Notification check
      if (simulateError) {
        throw new Error('Notification module encountered internal error');
      }

      // Commit transaction
      for (const [u, a] of transaction.pendingCharges) {
        this.database.charges.set(u, a);
      }
      this.database.orders.push(...transaction.pendingOrders);
      console.log('     Transaction committed.');
    } catch (err) {
      // Automatic Atomic Rollback
      const duration = Date.now() - startTime;
      console.log(`\n⚠️  ERROR CAUGHT in Modular Monolith after ${duration}ms!`);
      console.log(`   Error: ${err.message}`);
      console.log('   ROLLING BACK ENTIRE TRANSACTION...');
      transaction.pendingCharges.clear();
      transaction.pendingOrders = [];

      console.log('   PROTECTED STATE:');
      console.log(`   - Committed charges in database: ${this.database.charges.size}`);
      console.log(`   - Committed orders in database:  ${this.database.orders.length}`);
      console.log('   - Result: 100% data consistency guaranteed by ACID database transaction!\n');
    }
  }
}

const monolith = new ModularMonolithApp();
await monolith.checkoutWithTransaction('usr_carol', 'item_macbook', 1999, true);

console.log('================================================================');
console.log('SUMMARY: Microservices turn function calls into fallible network hops.');
console.log('Start with a Modular Monolith unless organization size demands microservices!');
console.log('================================================================');
