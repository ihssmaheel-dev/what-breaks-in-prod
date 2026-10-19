/**
 * demo.mjs - Demonstration of Serialization, BigInt Precision Loss, and Binary Formats
 *
 * Demonstrates:
 * 1. The silent float-rounding bug when 64-bit BigInts are parsed as JSON numbers.
 * 2. How string-based serialization preserves exact precision for financial & database IDs.
 * 3. Payload size comparison: JSON text vs packed binary encoding.
 *
 * Zero dependencies. Run with:
 *   node docs/01-foundations/003-serialization-json-protobuf-and-bigint-precision/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Serialization, BigInt Precision, and Binary Encodings');
console.log('================================================================\n');

// --- PART 1: THE BIGINT PRECISION TRAP IN STANDARD JSON ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Silent Float Rounding Trap in Standard JSON');
console.log('----------------------------------------------------------------');

const originalTx1 = 9007199254740995n; // Odd number exceeding 2^53 - 1
const originalTx2 = 9007199254740996n; // Even number right next to it

console.log(`Max Safe Integer in JavaScript: ${Number.MAX_SAFE_INTEGER}`);
console.log(`Original Transaction 1 ID:      ${originalTx1.toString()}n`);
console.log(`Original Transaction 2 ID:      ${originalTx2.toString()}n`);
console.log(`Are the original IDs different?  ${originalTx1 !== originalTx2} (Yes, two distinct transactions)`);

// Simulated server sending them as raw JSON numbers
const rawJson1 = `{"transactionId": ${originalTx1.toString()}, "amount": 150.00}`;
const rawJson2 = `{"transactionId": ${originalTx2.toString()}, "amount": 150.00}`;

// Client parses them with standard JSON.parse()
const parsed1 = JSON.parse(rawJson1);
const parsed2 = JSON.parse(rawJson2);

console.log('\n[After JSON.parse() in standard JavaScript runtime]:');
console.log(`  Parsed Transaction 1: ${parsed1.transactionId} (CORRUPTED: 5 became 6!)`);
console.log(`  Parsed Transaction 2: ${parsed2.transactionId}`);
console.log(`  Do the parsed IDs collide? ${parsed1.transactionId === parsed2.transactionId} (COLLISION!)`);
console.log('  Danger: A refund for transaction 1 will execute against transaction 2!\n');

// --- PART 2: THE FIXED PATTERN (STRING SERIALIZATION) ---
console.log('----------------------------------------------------------------');
console.log('PART 2: The Production Fix (Serialize 64-bit IDs as Strings)');
console.log('----------------------------------------------------------------');

// Server serializes BigInt as a string: "9007199254740995"
const safeJson1 = JSON.stringify({
  transactionId: originalTx1.toString(),
  amount: 150.0,
});

console.log('Transmitted JSON payload:');
console.log(`  ${safeJson1}`);

const safeParsed1 = JSON.parse(safeJson1);
// Convert back to BigInt for exact math
const restoredTx1 = BigInt(safeParsed1.transactionId);

console.log(`\nOriginal ID:  ${originalTx1.toString()}n`);
console.log(`Restored ID:  ${restoredTx1.toString()}n`);
console.log(`Matches 100%? ${originalTx1 === restoredTx1} (Exact precision preserved!)\n`);

// --- PART 3: PAYLOAD SIZE (JSON TEXT VS BINARY ENCODING) ---
console.log('----------------------------------------------------------------');
console.log('PART 3: Payload Size Comparison (JSON Text vs Packed Binary)');
console.log('----------------------------------------------------------------');

// A sample collection of 100 typical server telemetry records
const records = [];
for (let i = 1; i <= 100; i++) {
  records.push({
    id: i,
    userId: 1000 + i,
    status: 1, // 1 = active
    latencyMs: 42.5,
  });
}

// 1. Text JSON representation
const jsonString = JSON.stringify(records);
const jsonBuffer = Buffer.from(jsonString, 'utf-8');

// 2. Simulated packed binary representation (Tag-Length-Value concept used by Protobuf)
// In Protobuf, field names are NOT repeated; each field is a 1-byte tag + binary value
const binaryChunkSize = 4 + 4 + 1 + 4; // 13 bytes per record
const binaryBuffer = Buffer.alloc(records.length * binaryChunkSize);
let offset = 0;
for (const r of records) {
  binaryBuffer.writeUInt32BE(r.id, offset);
  binaryBuffer.writeUInt32BE(r.userId, offset + 4);
  binaryBuffer.writeUInt8(r.status, offset + 8);
  binaryBuffer.writeFloatBE(r.latencyMs, offset + 9);
  offset += binaryChunkSize;
}

console.log(`Records processed: ${records.length}`);
console.log(`JSON text size:    ${jsonBuffer.length} bytes (Repeats "id", "userId", "status", "latencyMs" 100x)`);
console.log(`Binary packed size: ${binaryBuffer.length} bytes (Uses compact numeric tags)`);

const savings = Math.round((1 - binaryBuffer.length / jsonBuffer.length) * 100);
console.log(`Bandwidth reduction: ~${savings}% smaller with binary serialization.\n`);

console.log('================================================================');
console.log('Demo completed successfully. Clean exit.');
console.log('================================================================');
