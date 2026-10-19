/**
 * demo.mjs - Demonstration of Environment Config and the Fail-Fast Validator
 *
 * Demonstrates:
 * 1. The Dangerous Fallback Anti-Pattern: A missing environment variable quietly
 *    falls back to a dangerous database connection string.
 * 2. Type Coercion Trap: Environment variables are always strings, causing
 *    boolean flags like "false" to evaluate as truthy.
 * 3. The Production Fix (Fail-Fast Schema Validator): Centralized configuration
 *    that validates all required environment variables on startup, casts types,
 *    and prevents the server from booting if anything is wrong.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/005-environment-config-and-the-12-factor-app/demo.mjs
 */

console.log('================================================================');
console.log('DEMO: Environment Config and the 12-Factor App');
console.log('================================================================\n');

// --- PART 1: THE DANGEROUS FALLBACK ANTI-PATTERN ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Dangerous Fallback Anti-Pattern');
console.log('----------------------------------------------------------------');

// Imagine process.env has no DATABASE_URL set
const simulatedEnvMissing = {};

function getDatabaseConfigNaive(env) {
  return {
    // ANTI-PATTERN: Falling back to a real host or prod-like default!
    databaseUrl: env.DATABASE_URL || 'postgres://app:secret@prod-db.internal:5432/main',
    port: env.PORT || 3000,
    maintenanceMode: env.MAINTENANCE_MODE || false,
  };
}

const badConfig = getDatabaseConfigNaive(simulatedEnvMissing);
console.log('Environment variable DATABASE_URL was undefined.');
console.log('Resulting databaseUrl:', badConfig.databaseUrl);
console.log('DANGER: The app silently defaulted to the production database!\n');

// --- PART 2: THE BOOLEAN TYPE COERCION TRAP ---
console.log('----------------------------------------------------------------');
console.log('PART 2: The String-to-Boolean Coercion Trap');
console.log('----------------------------------------------------------------');

// In bash or Docker, someone sets MAINTENANCE_MODE="false"
const simulatedEnvStrings = {
  MAINTENANCE_MODE: 'false',
};

// Naive check: if (process.env.MAINTENANCE_MODE)
const isMaintenanceActiveNaive = Boolean(simulatedEnvStrings.MAINTENANCE_MODE);
console.log(`Raw env string: "${simulatedEnvStrings.MAINTENANCE_MODE}"`);
console.log(`Boolean("false") in JavaScript evaluates to: ${isMaintenanceActiveNaive}`);
console.log('DANGER: The app entered maintenance mode because any non-empty string is truthy!\n');

// --- PART 3: THE PRODUCTION FIX (FAIL-FAST CONFIG VALIDATOR) ---
console.log('----------------------------------------------------------------');
console.log('PART 3: The Production Solution (Fail-Fast Validated Config)');
console.log('----------------------------------------------------------------');

/**
 * Validates and strictly parses environment variables before boot.
 * If anything is missing or invalid, throws an explicit error immediately.
 */
function loadConfig(env) {
  const errors = [];

  // 1. Required string: DATABASE_URL
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl || typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    errors.push('DATABASE_URL is required and must not be empty.');
  } else if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection URI.');
  }

  // 2. Integer with safe default: PORT
  const rawPort = env.PORT ?? '3000';
  const port = parseInt(rawPort, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be a valid port number between 1 and 65535, received: "${rawPort}".`);
  }

  // 3. Boolean parsing: MAINTENANCE_MODE
  const rawMaintenance = env.MAINTENANCE_MODE ?? 'false';
  let maintenanceMode = false;
  if (rawMaintenance === 'true' || rawMaintenance === '1') {
    maintenanceMode = true;
  } else if (rawMaintenance === 'false' || rawMaintenance === '0') {
    maintenanceMode = false;
  } else {
    errors.push(`MAINTENANCE_MODE must be "true", "false", "1", or "0", received: "${rawMaintenance}".`);
  }

  // 4. Enumeration: NODE_ENV
  const nodeEnv = env.NODE_ENV || 'development';
  const allowedEnvs = ['development', 'test', 'staging', 'production'];
  if (!allowedEnvs.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${allowedEnvs.join(', ')}, received: "${nodeEnv}".`);
  }

  if (errors.length > 0) {
    const errorMsg = [
      '❌ CONFIGURATION ERROR: Server startup aborted due to invalid environment variables:',
      ...errors.map((e) => `   - ${e}`),
    ].join('\n');
    throw new Error(errorMsg);
  }

  return Object.freeze({
    databaseUrl,
    port,
    maintenanceMode,
    nodeEnv,
  });
}

// Test A: Booting with missing DATABASE_URL (Should fail immediately)
console.log('Test A: Booting with unconfigured environment...');
try {
  loadConfig({});
  console.log('ERROR: Should not have passed!');
} catch (err) {
  console.log('Expected boot failure caught cleanly:');
  console.log(err.message);
  console.log('Result: The server refuses to boot, preventing silent disaster.\n');
}

// Test B: Booting with valid environment
console.log('Test B: Booting with valid production environment variables...');
const validEnv = {
  DATABASE_URL: 'postgres://user:secure_pass@db.prod.internal:5432/app_db',
  PORT: '8080',
  MAINTENANCE_MODE: 'false',
  NODE_ENV: 'production',
};

const safeConfig = loadConfig(validEnv);
console.log('Validated & Typed Config:');
console.log(`  Database URL:     ${safeConfig.databaseUrl}`);
console.log(`  Port:             ${safeConfig.port} (Type: ${typeof safeConfig.port})`);
console.log(`  Maintenance Mode: ${safeConfig.maintenanceMode} (Type: ${typeof safeConfig.maintenanceMode})`);
console.log(`  Environment:      ${safeConfig.nodeEnv}`);
console.log('Result: Config is frozen and completely safe to use across the entire application!\n');

console.log('================================================================');
console.log('SUMMARY: Never hardcode config. Never fall back to dangerous defaults.');
console.log('Validate and freeze all environment variables on boot!');
console.log('================================================================');
