'use strict';

// Avatar upload handling for customer self-service profiles.
// No multer/file-type dependency is installed in this project, so uploads are
// accepted as a base64 data URL in the JSON body (express.json is already
// configured with a 50mb limit in server.js) and validated server-side by
// inspecting the actual file bytes (magic numbers) rather than trusting the
// client-supplied MIME type or file extension.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
const PUBLIC_PREFIX = '/uploads/avatars';

// Signature table: checks the real leading bytes of the decoded buffer.
const SIGNATURES = [
  { ext: 'png', mime: 'image/png', check: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'jpg', mime: 'image/jpeg', check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: 'webp',
    mime: 'image/webp',
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  }
];

function ensureDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function detectType(buffer) {
  return SIGNATURES.find((sig) => sig.check(buffer)) || null;
}

// Accepts a data URL ("data:image/png;base64,...") or raw base64 string.
// Returns { url, filename } on success, throws Error with a user-safe message otherwise.
exports.saveAvatarFromBase64 = (input) => {
  if (!input || typeof input !== 'string') {
    throw new Error('No image data provided.');
  }

  const commaIndex = input.indexOf(',');
  const base64Data = input.startsWith('data:') && commaIndex !== -1 ? input.slice(commaIndex + 1) : input;

  let buffer;
  try {
    buffer = Buffer.from(base64Data, 'base64');
  } catch {
    throw new Error('Invalid image data.');
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid image data.');
  }

  if (buffer.length > MAX_BYTES) {
    throw new Error('Image is too large. Maximum size is 2MB.');
  }

  // Validate the REAL file type via magic bytes — never trust the data URL's
  // declared MIME type or any client-supplied filename/extension.
  const type = detectType(buffer);
  if (!type) {
    throw new Error('Unsupported image type. Please upload a PNG, JPG, or WEBP image.');
  }

  ensureDir();

  // Random filename — never derived from user input.
  const filename = `${crypto.randomUUID()}.${type.ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  return { url: `${PUBLIC_PREFIX}/${filename}`, filename };
};

// Best-effort removal of a previously uploaded avatar file (never throws).
// Only deletes files that live under our own uploads/avatars directory —
// avatarUrl values pointing elsewhere (e.g. a default asset) are left alone.
exports.deleteAvatarFile = (avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.startsWith(PUBLIC_PREFIX + '/')) {
    return;
  }

  const filename = path.basename(avatarUrl);
  const filePath = path.join(UPLOAD_DIR, filename);

  // Defense in depth against path traversal even though basename() already strips it.
  if (path.dirname(filePath) !== UPLOAD_DIR) return;

  fs.unlink(filePath, () => {});
};

exports.UPLOAD_DIR = UPLOAD_DIR;
exports.PUBLIC_PREFIX = PUBLIC_PREFIX;
