/**
 * demo.mjs - Demonstration of File Uploads and Presigned Object Storage
 *
 * Demonstrates:
 * 1. The Bottleneck: Why proxying file uploads through API memory exhausts RAM
 *    and ties up worker threads.
 * 2. Cryptographic Presigning: How the API signs a temporary upload token using
 *    HMAC-SHA256 with an expiration timestamp and restricted object key.
 * 3. Direct-to-Storage Upload: The client sends file bytes directly to the storage
 *    service without consuming a single byte of API server RAM.
 *
 * Zero external dependencies. Run with:
 *   node docs/01-foundations/011-file-uploads-and-presigned-object-storage/demo.mjs
 */

import { createHmac } from 'node:crypto';
import { createServer } from 'node:http';

console.log('================================================================');
console.log('DEMO: File Uploads and Presigned Object Storage');
console.log('================================================================\n');

// Simulated storage secret key (kept private on API server)
const STORAGE_SIGNING_SECRET = 'secret-storage-signing-key-xyz';

// Helper: Sign an upload request using HMAC-SHA256
function generatePresignedUploadUrl(bucket, objectKey, maxBytes, expiresInSeconds = 300) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const stringToSign = `PUT\n${bucket}\n${objectKey}\n${maxBytes}\n${expiresAt}`;

  const signature = createHmac('sha256', STORAGE_SIGNING_SECRET)
    .update(stringToSign)
    .digest('hex');

  // Returns URL with query parameters containing security token
  return {
    uploadUrl: `/storage/${bucket}/${objectKey}?expires=${expiresAt}&maxBytes=${maxBytes}&signature=${signature}`,
    expiresAt,
    maxBytes,
  };
}

// Helper: Verify presigned signature
function verifyPresignedSignature(bucket, objectKey, maxBytes, expiresAt, signature) {
  const now = Math.floor(Date.now() / 1000);
  if (now > parseInt(expiresAt, 10)) {
    return { valid: false, reason: 'Presigned URL has expired' };
  }

  const stringToSign = `PUT\n${bucket}\n${objectKey}\n${maxBytes}\n${expiresAt}`;
  const expectedSignature = createHmac('sha256', STORAGE_SIGNING_SECRET)
    .update(stringToSign)
    .digest('hex');

  if (signature !== expectedSignature) {
    return { valid: false, reason: 'Invalid cryptographic signature' };
  }

  return { valid: true };
}

// --- PART 1: THE BOTTLENECK OF PROXYING UPLOADS ---
console.log('----------------------------------------------------------------');
console.log('PART 1: The Bottleneck of Uploading Files Through API Servers');
console.log('----------------------------------------------------------------');
console.log('Imagine 100 users upload 500MB videos simultaneously through Express:');
console.log('  - Total RAM required to buffer uploads: 100 x 500MB = 50,000MB (50GB!)');
console.log('  - Node.js default heap limit: 2GB to 4GB.');
console.log('  - Result: Out-Of-Memory (OOM) crash kills the API process.');
console.log('  - Bandwidth cost: Server pays double (Client -> Server -> S3).\n');

// --- PART 2: THE PRODUCTION FIX (PRESIGNED DIRECT UPLOAD) ---
console.log('----------------------------------------------------------------');
console.log('PART 2: Presigned Direct Upload Pipeline in Action');
console.log('----------------------------------------------------------------');

// Create mock server simulating API and Object Storage
const mockStorage = new Map();

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Endpoint A: API Server generating presigned URL
  if (pathname === '/api/uploads/request-url') {
    // API verifies user auth (takes < 2ms and 0 bytes of file RAM)
    const userId = 'usr_alice';
    const objectKey = `users/${userId}/video_${Date.now()}.mp4`;
    const maxBytes = 50 * 1024 * 1024; // 50MB limit

    const presigned = generatePresignedUploadUrl('my-cloud-bucket', objectKey, maxBytes, 60);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        status: 'authorized',
        directUploadUrl: presigned.uploadUrl,
        expiresInSeconds: 60,
      })
    );
  }

  // Endpoint B: Object Storage receiving direct PUT upload
  if (pathname.startsWith('/storage/')) {
    const [, , bucket, ...keyParts] = pathname.split('/');
    const objectKey = keyParts.join('/');
    const expires = url.searchParams.get('expires');
    const maxBytes = url.searchParams.get('maxBytes');
    const signature = url.searchParams.get('signature');

    // Verify signature
    const verification = verifyPresignedSignature(bucket, objectKey, maxBytes, expires, signature);
    if (!verification.valid) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: verification.reason }));
    }

    // Read incoming stream directly into storage
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length > parseInt(maxBytes, 10)) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'File exceeds maximum allowed size' }));
      }
      mockStorage.set(objectKey, buffer.length);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'uploaded', objectKey, bytesStored: buffer.length }));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Step 1: Client requests signed ticket from API
    console.log('Step 1: Client requests upload ticket from API...');
    const ticketRes = await fetch(`${baseUrl}/api/uploads/request-url`);
    const ticket = await ticketRes.json();
    console.log('  API response received:');
    console.log(`  Upload URL: ${ticket.directUploadUrl}`);
    console.log('  API server spent 0MB buffering files!\n');

    // Step 2: Client uploads directly to Storage Service using PUT
    console.log('Step 2: Client uploads 1MB payload DIRECTLY to Storage Service...');
    const simulatedFileBytes = Buffer.alloc(1024 * 1024, 'X'); // 1MB payload

    const uploadRes = await fetch(`${baseUrl}${ticket.directUploadUrl}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: simulatedFileBytes,
    });
    const uploadResult = await uploadRes.json();
    console.log(`  Storage response status: ${uploadRes.status}`);
    console.log(`  Result: ${JSON.stringify(uploadResult)}\n`);

    // Step 3: Test tampering with signature
    console.log('Step 3: Attacker attempts to upload with forged signature...');
    const tamperedUrl = ticket.directUploadUrl.replace('signature=', 'signature=forged123');
    const tamperedRes = await fetch(`${baseUrl}${tamperedUrl}`, {
      method: 'PUT',
      body: 'bad-data',
    });
    const tamperedBody = await tamperedRes.json();
    console.log(`  Tampered response status: ${tamperedRes.status}`);
    console.log(`  Storage rejected upload:  ${tamperedBody.error}\n`);

    console.log('================================================================');
    console.log('SUMMARY: Never proxy large file uploads through API servers.');
    console.log('Generate short-lived presigned URLs and upload directly to storage!');
    console.log('================================================================');
  } catch (err) {
    console.error('Demo error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
