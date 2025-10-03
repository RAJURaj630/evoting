const crypto = require('crypto');

console.log('=== GENERATING SECURE KEYS ===\n');

// Generate JWT Secret (64 characters)
const jwtSecret = crypto.randomBytes(64).toString('base64');
console.log('JWT_SECRET=' + jwtSecret);

// Generate 32-character encryption key for AES-256
const encryptionKey = crypto.randomBytes(32).toString('base64');
console.log('ENCRYPTION_KEY=' + encryptionKey);

// Alternative hex format
const jwtSecretHex = crypto.randomBytes(48).toString('hex');
const encryptionKeyHex = crypto.randomBytes(32).toString('hex');

console.log('\n=== Alternative Hex Format ===');
console.log('JWT_SECRET=' + jwtSecretHex);
console.log('ENCRYPTION_KEY=' + encryptionKeyHex);

console.log('\n=== VERIFICATION ===');
console.log('JWT Secret Length:', jwtSecret.length, 'characters');
console.log('Encryption Key Length:', encryptionKey.length, 'characters');
console.log('Encryption Key Byte Length:', Buffer.from(encryptionKey, 'base64').length, 'bytes');

console.log('\n⚠️  WARNING: Store these keys securely and never commit them to version control!');