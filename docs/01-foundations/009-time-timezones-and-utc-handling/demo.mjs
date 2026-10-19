/**
 * demo.mjs - Demonstration of Time, Timezones, and UTC Handling
 *
 * Demonstrates:
 * 1. The Naive Timezone Drift Trap: Two clients submit timestamps without timezone
 *    information, causing the server to misinterpret the order of events.
 * 2. The 24-Hour Daylight Saving Time Trap: Adding 24 hours (86,400,000 ms) to a local
 *    date during DST transition shifts the appointment to the wrong hour of the day.
 * 3. The Production Fix: Storing UTC timestamps, transmitting unambiguous ISO 8601
 *    strings, and rendering in the target user's local timezone.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/009-time-timezones-and-utc-handling/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Time, Timezones, and UTC Handling');
console.log('================================================================\n');

// --- PART 1: THE NAIVE TIMESTAMP MISINTERPRETATION ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Ambiguous Naive Timestamp Trap');
console.log('----------------------------------------------------------------');

// User A in New York and User B in London submit their local order time
const orderTimeUserA = '2026-10-19 14:00:00'; // 2:00 PM Eastern (EDT is UTC-4)
const orderTimeUserB = '2026-10-19 15:00:00'; // 3:00 PM British Summer Time (BST is UTC+1)

console.log('Naive string from User A (New York):', orderTimeUserA);
console.log('Naive string from User B (London):  ', orderTimeUserB);

// Naive comparison: A developer compares strings or parses without timezones
const naiveComparison = orderTimeUserA < orderTimeUserB;
console.log(`Naive string check says User A ordered first: ${naiveComparison}`);

// Actual real-world points in time:
// User A: 14:00 EDT = 18:00 UTC
// User B: 15:00 BST = 14:00 UTC
const realTimeUserA = new Date('2026-10-19T14:00:00-04:00').getTime();
const realTimeUserB = new Date('2026-10-19T15:00:00+01:00').getTime();

console.log(`\nReal UTC points in time:`);
console.log(`  User A (New York): ${new Date(realTimeUserA).toISOString()}`);
console.log(`  User B (London):   ${new Date(realTimeUserB).toISOString()}`);
console.log(`Who actually ordered first? ${realTimeUserB < realTimeUserA ? 'User B (London) was 4 hours earlier!' : 'User A'}`);
console.log('DANGER: Without timezone offsets, event ordering and financial trades are inverted!\n');

// --- PART 2: THE DAYLIGHT SAVING TIME "24 HOURS" BUG ---
console.log('----------------------------------------------------------------');
console.log('PART 2: The 24-Hour Daylight Saving Time Trap');
console.log('----------------------------------------------------------------');

// In New York, clocks "spring forward" 1 hour on Sunday, March 8, 2026.
// That day has only 23 hours!
console.log('Scenario: A patient books a daily medication reminder for 9:00 AM.');
console.log('A naive developer calculates tomorrow by adding (24 * 60 * 60 * 1000) milliseconds.');

const appointmentUtc = Date.UTC(2026, 2, 7, 14, 0, 0); // Saturday March 7, 2026 at 9:00 AM EST (14:00 UTC)
const nextDayNaiveUtc = appointmentUtc + 24 * 60 * 60 * 1000;

// Format in America/New_York timezone
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'medium',
  timeStyle: 'medium',
});

console.log(`  Saturday Reminder: ${formatter.format(new Date(appointmentUtc))}`);
console.log(`  Sunday (+24h MS):  ${formatter.format(new Date(nextDayNaiveUtc))}`);
console.log('DISASTER CONFIRMED:');
console.log('  The patient reminder jumped from 9:00 AM to 10:00 AM because DST lost an hour!');
console.log('  Human calendar days do not always have 24 hours.\n');

// --- PART 3: THE PRODUCTION FIX (UTC PIPELINE) ---
console.log('----------------------------------------------------------------');
console.log('PART 3: The Production Pipeline (UTC Storage & Local Display)');
console.log('----------------------------------------------------------------');

/**
 * 1. Parse client input into absolute UTC milliseconds.
 * 2. Store UTC in database.
 * 3. Render in any requested user timezone using Intl.DateTimeFormat.
 */
function recordAppointment(isoWithOffsetString) {
  // Parse into UTC timestamp
  const dateObj = new Date(isoWithOffsetString);
  if (Number.isNaN(dateObj.getTime())) {
    throw new Error('Invalid ISO 8601 date string');
  }

  // Canonical UTC storage representation
  const canonicalUtcString = dateObj.toISOString();
  const epochMs = dateObj.getTime();

  return { canonicalUtcString, epochMs };
}

function displayInTimezone(epochMs, targetTimezone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: targetTimezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(epochMs));
}

// Client in Tokyo submits appointment
const clientInput = '2026-10-20T10:00:00+09:00'; // 10:00 AM in Tokyo
const stored = recordAppointment(clientInput);

console.log('Client input from Tokyo:       ', clientInput);
console.log('Stored in Database (UTC):      ', stored.canonicalUtcString);
console.log('Epoch Milliseconds:            ', stored.epochMs);

console.log('\nRendering same event for doctors in different offices:');
console.log('  Doctor in Tokyo:       ', displayInTimezone(stored.epochMs, 'Asia/Tokyo'));
console.log('  Doctor in London:      ', displayInTimezone(stored.epochMs, 'Europe/London'));
console.log('  Doctor in San Francisco:', displayInTimezone(stored.epochMs, 'America/Los_Angeles'));

console.log('\n================================================================');
console.log('SUMMARY: Store in UTC. Transmit with ISO 8601 offsets.');
console.log('Render in local timezone only at the presentation layer!');
console.log('================================================================');
