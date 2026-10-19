#!/usr/bin/env node

/**
 * scripts/check-demos.mjs
 *
 * Runs every demo.mjs in docs/ using Node.js and fails on error.
 * Ensures zero-dependency execution and production reliability for all code demos.
 *
 * Usage:
 *   node scripts/check-demos.mjs
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const docsDir = join(rootDir, 'docs');

const TIMEOUT_MS = 10000; // 10s per demo

/**
 * Recursively find all demo.mjs files in docs/
 */
function findDemos(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findDemos(fullPath, fileList);
    } else if (entry === 'demo.mjs') {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

/**
 * Run a single demo script in a child process
 */
function runDemo(filePath) {
  return new Promise((resolve) => {
    const rel = relative(rootDir, filePath);
    const child = spawn(process.execPath, [filePath], {
      cwd: dirname(filePath),
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, TIMEOUT_MS);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        resolve({
          path: rel,
          success: false,
          error: `Demo timed out after ${TIMEOUT_MS / 1000}s`,
          stdout,
          stderr,
        });
      } else if (code !== 0) {
        resolve({
          path: rel,
          success: false,
          error: `Process exited with code ${code}`,
          stdout,
          stderr,
        });
      } else {
        resolve({
          path: rel,
          success: true,
          stdout,
        });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        path: rel,
        success: false,
        error: err.message,
        stdout,
        stderr,
      });
    });
  });
}

async function main() {
  console.log('Scanning for concept demos in docs/...\n');
  const demoFiles = findDemos(docsDir);

  if (demoFiles.length === 0) {
    console.log('No demo.mjs files found. All clean!');
    process.exit(0);
  }

  console.log(`Found ${demoFiles.length} demo(s) to verify:`);
  let failedCount = 0;

  for (const file of demoFiles) {
    const rel = relative(rootDir, file);
    process.stdout.write(`  Running ${rel} ... `);
    const result = await runDemo(file);

    if (result.success) {
      console.log('✅ PASS');
    } else {
      console.log('❌ FAIL');
      console.error(`\n[ERROR in ${result.path}]`);
      console.error(`Reason: ${result.error}`);
      if (result.stderr) {
        console.error(`STDERR:\n${result.stderr}`);
      }
      if (result.stdout) {
        console.error(`STDOUT:\n${result.stdout}`);
      }
      console.error('-------------------------------------------\n');
      failedCount++;
    }
  }

  console.log('\n==========================================');
  console.log(`Summary: ${demoFiles.length - failedCount}/${demoFiles.length} demos passed.`);
  console.log('==========================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected runner failure:', err);
  process.exit(1);
});
