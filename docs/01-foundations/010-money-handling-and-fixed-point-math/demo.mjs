/**
 * demo.mjs - Demonstration of Money Handling and Fixed-Point Math
 *
 * Demonstrates:
 * 1. The IEEE 754 Floating-Point Precision Trap: Why 0.1 + 0.2 !== 0.3 in JavaScript.
 * 2. Compounding Drift in Shopping Cart Invoices: How fractional cents create
 *    unbalanced accounting ledgers.
 * 3. The Production Fix: Integer math in minor currency units (cents), and the
 *    Remainder Allocation Algorithm to split money evenly without losing pennies.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/010-money-handling-and-fixed-point-math/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Money Handling and Fixed-Point Math');
console.log('================================================================\n');

// --- PART 1: THE FLOATING-POINT EQUALITY TRAP ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Classic Floating-Point Precision Trap');
console.log('----------------------------------------------------------------');

const price1 = 0.1;
const price2 = 0.2;
const sum = price1 + price2;

console.log(`Adding $0.10 + $0.20 in standard JavaScript:`);
console.log(`  Expected: 0.3`);
console.log(`  Actual:   ${sum}`);
console.log(`  Does 0.1 + 0.2 === 0.3? ${sum === 0.3}`);
console.log('DANGER: If an automated checkout checks "if (balance === total)", it fails!\n');

// --- PART 2: COMPOUNDING DRIFT AND ROUNDING MISMATCH ---
console.log('----------------------------------------------------------------');
console.log('PART 2: Compounding Drift & Invoice Rounding Mismatch');
console.log('----------------------------------------------------------------');

// Example A: Summing $0.10 ten times in floating-point
let floatBalance = 0;
for (let i = 0; i < 10; i++) {
  floatBalance += 0.1;
}

console.log('1. Float Accumulation Trap:');
console.log('   Adding $0.10 ten times:');
console.log(`   Expected sum: 1.0`);
console.log(`   Actual sum:   ${floatBalance}`);
console.log(`   Does floatBalance === 1.0? ${floatBalance === 1.0} (Drifted by 0.0000000000000001!)\n`);

// Example B: The Line-Item Tax Rounding Mismatch (Classic E-Commerce Bug)
console.log('2. The Line-Item Rounding Mismatch:');
console.log('   Order: 10 items at $19.99 each. Tax rate: 8.25%.');

// Method 1: Rounding tax on each line item (as printed on individual receipt lines)
const singleTaxRounded = Math.round(19.99 * 0.0825 * 100) / 100; // $1.65 per item
const totalLineTax = singleTaxRounded * 10; // $16.50

// Method 2: Calculating tax on the subtotal ($199.90)
const subtotal = 19.99 * 10; // $199.90
const totalSubtotalTax = Math.round(subtotal * 0.0825 * 100) / 100; // $16.49

console.log(`   Method A (Sum of rounded line taxes: 10 x $${singleTaxRounded.toFixed(2)}): $${totalLineTax.toFixed(2)}`);
console.log(`   Method B (Tax on subtotal $${subtotal.toFixed(2)} x 8.25%):           $${totalSubtotalTax.toFixed(2)}`);
console.log(`   Discrepancy: $${Math.abs(totalLineTax - totalSubtotalTax).toFixed(2)} difference!`);
console.log('   DANGER: One penny mismatch triggers audit freezes on million-dollar ledgers.\n');

// --- PART 3: THE PRODUCTION FIX (INTEGER CENTS & ALLOCATION) ---
console.log('----------------------------------------------------------------');
console.log('PART 3: Integer Minor Units (Cents) & Exact Allocation');
console.log('----------------------------------------------------------------');

// 1. Integer representation (Stripe pattern)
// $19.99 -> 1999 cents
const itemCount = 10;
const itemPriceCents = 1999;
const totalCents = itemPriceCents * itemCount; // 19990 cents ($199.90)

console.log(`Item price: ${itemPriceCents} cents ($19.99)`);
console.log(`10 items:   ${totalCents} cents ($199.90)`);

// 2. The Remainder Allocation Algorithm (Splitting Money Cleanly)
// Scenario: Split a $10.00 bill (1000 cents) equally among 3 people.
// Naive division: 1000 / 3 = 333.3333333333333 cents.
// Rounding everyone to 333 cents totals 999 cents (1 cent is lost!).
console.log('\nScenario: Splitting 1000 cents ($10.00) between 3 accounts:');

function allocateCents(totalCentsToSplit, ratios) {
  const totalWeight = ratios.reduce((acc, r) => acc + r, 0);
  let remainder = totalCentsToSplit;

  // Compute base shares
  const results = ratios.map((ratio) => {
    const share = Math.floor((totalCentsToSplit * ratio) / totalWeight);
    remainder -= share;
    return share;
  });

  // Distribute remaining cents one by one to avoid losing money
  for (let i = 0; i < remainder; i++) {
    results[i % results.length] += 1;
  }

  return results;
}

const shares = allocateCents(1000, [1, 1, 1]);
console.log(`  Person 1 pays: ${shares[0]} cents ($${(shares[0] / 100).toFixed(2)})`);
console.log(`  Person 2 pays: ${shares[1]} cents ($${(shares[1] / 100).toFixed(2)})`);
console.log(`  Person 3 pays: ${shares[2]} cents ($${(shares[2] / 100).toFixed(2)})`);

const allocatedSum = shares.reduce((a, b) => a + b, 0);
console.log(`  Total collected: ${allocatedSum} cents ($${(allocatedSum / 100).toFixed(2)})`);
console.log(`  Does total equal original $10.00? ${allocatedSum === 1000} (Zero pennies lost!)`);

console.log('\n================================================================');
console.log('SUMMARY: Never store money as floats. Store integer cents.');
console.log('Always allocate remainders so total splits match the original sum!');
console.log('================================================================');
