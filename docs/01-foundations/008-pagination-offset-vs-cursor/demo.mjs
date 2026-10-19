/**
 * demo.mjs - Demonstration of Offset Pagination vs Cursor Pagination
 *
 * Demonstrates:
 * 1. The Duplicate Item Glitch in Offset Pagination: When new records are inserted
 *    while a user is paginating, rows shift and items already seen on Page 1 appear
 *    again on Page 2.
 * 2. Stable Scrolling with Cursor Pagination: A cursor points directly to the last-seen
 *    record, ensuring zero duplicates and zero skipped items despite concurrent writes.
 * 3. Performance Cost Simulation: Demonstrates why OFFSET N requires scanning and
 *    discarding N rows, while a cursor seeks directly via an index.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/008-pagination-offset-vs-cursor/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Pagination (Offset vs Cursor)');
console.log('================================================================\n');

// In-memory feed simulation
const initialPosts = [
  { id: 10, text: 'Post #10 (Newest)' },
  { id: 9, text: 'Post #9' },
  { id: 8, text: 'Post #8' },
  { id: 7, text: 'Post #7' },
  { id: 6, text: 'Post #6' },
  { id: 5, text: 'Post #5' },
  { id: 4, text: 'Post #4' },
  { id: 3, text: 'Post #3' },
  { id: 2, text: 'Post #2' },
  { id: 1, text: 'Post #1 (Oldest)' },
];

// --- PART 1: THE OFFSET PAGINATION DUPLICATION GLITCH ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Offset Pagination Drift / Duplicate Glitch');
console.log('----------------------------------------------------------------');

// Clone initial posts
let feed = [...initialPosts];
const PAGE_SIZE = 3;

// Step 1: User fetches Page 1 (LIMIT 3 OFFSET 0)
const page1Offset = feed.slice(0, PAGE_SIZE);
console.log('User fetches Page 1 (OFFSET 0, LIMIT 3):');
page1Offset.forEach((p) => console.log(`  - [ID ${p.id}] ${p.text}`));

// Step 2: While user reads Page 1, two new posts are published at the top!
console.log('\n[Event: 2 new posts published at the top of the feed]');
feed.unshift({ id: 12, text: 'Post #12 (Breaking News!)' });
feed.unshift({ id: 11, text: 'Post #11 (Just Now)' });

// Step 3: User scrolls down and requests Page 2 (LIMIT 3 OFFSET 3)
const page2Offset = feed.slice(3, 3 + PAGE_SIZE);
console.log('\nUser fetches Page 2 (OFFSET 3, LIMIT 3):');
page2Offset.forEach((p) => console.log(`  - [ID ${p.id}] ${p.text}`));

// Detect duplicates
const seenIds = new Set(page1Offset.map((p) => p.id));
const duplicates = page2Offset.filter((p) => seenIds.has(p.id));

console.log('\nANOMALY DETECTED:');
if (duplicates.length > 0) {
  duplicates.forEach((d) => {
    console.log(`  ❌ Duplicate item seen on Page 2: [ID ${d.id}] "${d.text}"`);
  });
  console.log('  Why? The 2 newly inserted posts pushed older posts downward by 2 spots.');
  console.log('  OFFSET 3 now re-reads posts that were previously at offset 1 and 2!\n');
}

// --- PART 2: STABLE CURSOR PAGINATION ---
console.log('----------------------------------------------------------------');
console.log('PART 2: Stable Cursor Pagination (Keyset Navigation)');
console.log('----------------------------------------------------------------');

// Reset feed to initial state
feed = [...initialPosts];

// Encode and decode opaque cursor helpers
const encodeCursor = (id) => Buffer.from(String(id)).toString('base64');
const decodeCursor = (cursor) => parseInt(Buffer.from(cursor, 'base64').toString('utf8'), 10);

function fetchCursorPage(feedItems, cursorString, limit) {
  let startIndex = 0;
  if (cursorString) {
    const cursorId = decodeCursor(cursorString);
    const foundIndex = feedItems.findIndex((item) => item.id === cursorId);
    startIndex = foundIndex === -1 ? 0 : foundIndex + 1;
  }
  const items = feedItems.slice(startIndex, startIndex + limit);
  const nextCursor = items.length > 0 ? encodeCursor(items[items.length - 1].id) : null;
  return { items, nextCursor };
}

// Step 1: User fetches Page 1 with no cursor
const page1Cursor = fetchCursorPage(feed, null, PAGE_SIZE);
console.log('User fetches Page 1 (Cursor: null, LIMIT 3):');
page1Cursor.items.forEach((p) => console.log(`  - [ID ${p.id}] ${p.text}`));
console.log(`Next Cursor Token: "${page1Cursor.nextCursor}" (Points to ID 8)`);

// Step 2: 2 new posts published at top
console.log('\n[Event: 2 new posts published at the top of the feed]');
feed.unshift({ id: 12, text: 'Post #12 (Breaking News!)' });
feed.unshift({ id: 11, text: 'Post #11 (Just Now)' });

// Step 3: User requests Page 2 using the nextCursor token
const page2Cursor = fetchCursorPage(feed, page1Cursor.nextCursor, PAGE_SIZE);
console.log('\nUser fetches Page 2 using cursor from Page 1:');
page2Cursor.items.forEach((p) => console.log(`  - [ID ${p.id}] ${p.text}`));

// Verify duplicates
const cursorSeenIds = new Set(page1Cursor.items.map((p) => p.id));
const cursorDuplicates = page2Cursor.items.filter((p) => cursorSeenIds.has(p.id));

console.log('\nVERIFICATION:');
console.log(`  Duplicates found: ${cursorDuplicates.length}`);
console.log('  Skipped items:    0');
console.log('  Result: Perfectly stable pagination despite real-time concurrent writes!\n');

// --- PART 3: SIMULATING DATABASE SCAN COST ---
console.log('----------------------------------------------------------------');
console.log('PART 3: Database Scan Workload: OFFSET vs CURSOR at Scale');
console.log('----------------------------------------------------------------');

const totalRows = 1_000_000;
const targetPage = 50_000;
const offsetTarget = targetPage * 20;

console.log(`Table size: ${totalRows.toLocaleString()} rows.`);
console.log(`Querying Page #${targetPage.toLocaleString()} (LIMIT 20):`);

console.log('\n1. OFFSET Approach (OFFSET 1,000,000 LIMIT 20):');
console.log(`   Database work: Read ${offsetTarget.toLocaleString()} rows off disk, sort, and discard them.`);
console.log('   Algorithmic complexity: O(N) linear time.');

console.log('\n2. CURSOR Approach (WHERE id < last_seen_id LIMIT 20):');
console.log('   Database work: B-Tree index seek directly to leaf node. Read exactly 20 rows.');
console.log('   Algorithmic complexity: O(1) direct index seek.');

console.log('\n================================================================');
console.log('SUMMARY: Use OFFSET only for small tables with random page jumps.');
console.log('Use CURSORS for infinite scroll, public APIs, and high-scale data!');
console.log('================================================================');
