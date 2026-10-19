/**
 * demo.mjs - Demonstration of Input Validation, Sanitization, and Mass Assignment
 *
 * Demonstrates:
 * 1. The Mass Assignment Flaw: Blindly updating objects from request bodies allows
 *    callers to elevate their privileges (e.g. setting isAdmin: true).
 * 2. Unsanitized Payload Injection: Unbounded string lengths and dangerous control characters.
 * 3. The Production Fix: Strict allowlist validation, type enforcement, trimming,
 *    and field whitelisting.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/007-input-validation-and-sanitization/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Input Validation, Sanitization, and Mass Assignment');
console.log('================================================================\n');

// Simulated database record for a normal user
const userInDb = {
  id: 'usr_101',
  name: 'Carol Danvers',
  email: 'carol@example.com',
  role: 'member',
  isAdmin: false,
};

// --- PART 1: THE MASS ASSIGNMENT VULNERABILITY ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Broken Endpoint (Mass Assignment & No Validation)');
console.log('----------------------------------------------------------------');

// Malicious payload submitted by an attacker
const attackerPayload = {
  name: 'Carol Hacked',
  bio: 'Normal user bio here <script>alert("pwned")</script>',
  // Sneaky privilege escalation payload
  role: 'superuser',
  isAdmin: true,
};

function updateUserNaive(existingUser, rawInput) {
  // ANTI-PATTERN: Blindly merging untrusted client body into user record!
  return Object.assign({}, existingUser, rawInput);
}

const compromisedUser = updateUserNaive(userInDb, attackerPayload);
console.log('Original User Role:', userInDb.role, '| isAdmin:', userInDb.isAdmin);
console.log('Attacker Sent Payload:', JSON.stringify(attackerPayload));
console.log('Updated User Role: ', compromisedUser.role, '| isAdmin:', compromisedUser.isAdmin);
console.log('VULNERABILITY CONFIRMED:');
console.log('  The user elevated their own account to superuser and isAdmin = true!\n');

// --- PART 2: THE REJECTION OF DANGEROUS INPUT ---
console.log('----------------------------------------------------------------');
console.log('PART 2: Catastrophic Input Bounds (Missing Length Validation)');
console.log('----------------------------------------------------------------');

const hugeInput = 'A'.repeat(50_000); // 50KB string when 200 chars was expected
console.log(`Received bio with length: ${hugeInput.length} characters.`);
console.log('Without max-length validation, unbounded strings can exhaust database storage');
console.log('or trigger memory spikes across API servers.\n');

// --- PART 3: THE PRODUCTION FIX (ALLOWLIST VALIDATOR & SANITIZER) ---
console.log('----------------------------------------------------------------');
console.log('PART 3: The Production Solution (Strict Allowlist & Sanitization)');
console.log('----------------------------------------------------------------');

/**
 * Validates and sanitizes profile update input.
 * Strict Allowlist: ONLY explicitly allowed fields are accepted.
 * All unexpected fields are completely ignored.
 */
function validateAndSanitizeProfileUpdate(rawInput) {
  const errors = [];
  const sanitized = {};

  // 1. Validate & Sanitize 'name' (Optional, string, 2-50 chars)
  if (rawInput.name !== undefined) {
    if (typeof rawInput.name !== 'string') {
      errors.push('Field "name" must be a string.');
    } else {
      const trimmed = rawInput.name.trim();
      if (trimmed.length < 2 || trimmed.length > 50) {
        errors.push('Field "name" must be between 2 and 50 characters.');
      } else {
        // Strip out control characters or null bytes
        sanitized.name = trimmed.replace(/[\x00-\x1F\x7F]/g, '');
      }
    }
  }

  // 2. Validate & Sanitize 'bio' (Optional, string, max 200 chars)
  if (rawInput.bio !== undefined) {
    if (typeof rawInput.bio !== 'string') {
      errors.push('Field "bio" must be a string.');
    } else {
      const trimmed = rawInput.bio.trim();
      if (trimmed.length > 200) {
        errors.push('Field "bio" cannot exceed 200 characters.');
      } else {
        // Basic HTML entity encoding for bio text
        sanitized.bio = trimmed
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      }
    }
  }

  // Notice: 'role', 'isAdmin', and all other fields are NOT in the allowlist!
  // They are discarded completely.

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: sanitized };
}

// Test A: Attacker attempts privilege escalation through valid schema
console.log('Test A: Testing attacker payload against strict allowlist...');
const validationResult = validateAndSanitizeProfileUpdate(attackerPayload);

if (validationResult.success) {
  // Apply only the sanitized, allowlisted fields
  const safeUpdatedUser = { ...userInDb, ...validationResult.data };
  console.log('Sanitized Data Accepted:', JSON.stringify(validationResult.data));
  console.log('Safe User Role:   ', safeUpdatedUser.role, '(Unchanged!)');
  console.log('Safe User isAdmin:', safeUpdatedUser.isAdmin, '(Unchanged!)');
  console.log('Sanitized Bio:    ', safeUpdatedUser.bio);
  console.log('PROTECTION CONFIRMED:');
  console.log('  Attacker fields "role" and "isAdmin" were completely dropped!');
  console.log('  Malicious HTML tags in bio were safely encoded.\n');
}

// Test B: Testing oversized payload
console.log('Test B: Testing oversized payload rejection...');
const invalidResult = validateAndSanitizeProfileUpdate({ name: 'Valid Name', bio: hugeInput });
console.log('Validation success:', invalidResult.success);
console.log('Errors caught:     ', invalidResult.errors);
console.log('Result: The request was cleanly rejected with 400 Bad Request before database access!\n');

console.log('================================================================');
console.log('SUMMARY: Never trust client input. Validate types and lengths.');
console.log('Use strict field allowlists to eliminate mass assignment completely!');
console.log('================================================================');
