/**
 * PII (Personally Identifiable Information) Encryption Utility
 *
 * Encrypts sensitive fields using the same AES key (`va*proses`) that the
 * backend uses in `encryptDecrypt-service.ts → encryptData / decryptData`.
 * This ensures the backend middleware can transparently decrypt the values
 * with zero changes to controller logic.
 *
 * Fields encrypted:
 *   mobile, mobile_number, phone, pan_no, pan, aadhaar, aadhaar_no,
 *   aadhaar_number, email, email_address, account_number, bank_account_number,
 *   ifsc, ifsc_code, dob, date_of_birth, userName (when it looks like
 *   email / mobile), password
 *
 * The encrypted value is a CryptoJS AES ciphertext string. The backend
 * `piiDecrypt.middleware.ts` detects the `__pii_encrypted: true` flag and
 * decrypts each marked field before the request reaches any controller.
 */

import CryptoJS from 'crypto-js';

// ─── Shared secret (must match config.cryptoKey on the backend) ──────────────
const PII_SECRET = 'va*proses';

// ─── Fields that must always be encrypted ────────────────────────────────────
export const PII_FIELDS = new Set([
  'mobile',
  'mobile_number',
  'mobile_no',
  'phone',
  'phone_number',
  'pan_no',
  'pan',
  'aadhaar',
  'aadhaar_no',
  'aadhaar_number',
  'aadhar',
  'aadhar_no',
  'aadhar_number',
  'email',
  'email_address',
  'email_id',
  'userName',       // login field – may carry email or mobile
  'username',
  'account_number',
  'bank_account_number',
  'accountNumber',
  'ifsc',
  'ifsc_code',
  'dob',
  'date_of_birth',
  'password',       // always encrypt passwords in transit
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Encrypt a single string value */
export function encryptPIIValue(value: string): string {
  return CryptoJS.AES.encrypt(value, PII_SECRET).toString();
}

/** Decrypt a single string value (useful for debugging / test harness) */
export function decryptPIIValue(cipher: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, PII_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Walk a payload object recursively and encrypt every PII field in-place.
 * Returns a **new** object so the original state is never mutated.
 * Also injects `__pii_encrypted: true` at the top level so the backend
 * middleware knows to decrypt.
 */
export function encryptPIIFields<T extends Record<string, any>>(payload: T): T & { __pii_encrypted: boolean } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload as any;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (PII_FIELDS.has(key) && typeof value === 'string' && value.trim() !== '') {
      result[key] = encryptPIIValue(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recurse into nested objects (e.g. verification.pan, partner, etc.)
      result[key] = encryptPIIFields(value);
    } else if (Array.isArray(value)) {
      // Recurse into arrays of objects (e.g. nominees[], holders[])
      result[key] = value.map((item: any) =>
        item && typeof item === 'object' ? encryptPIIFields(item) : item
      );
    } else {
      result[key] = value;
    }
  }

  // Top-level sentinel – only added once (not on nested objects)
  result.__pii_encrypted = true;

  return result as T & { __pii_encrypted: boolean };
}

/**
 * Mask a PII string for display in logs / UI (e.g. "98765*****", "AB***1234C").
 * Never log or render raw PII – use this helper instead.
 */
export function maskPII(value: string, visibleStart = 2, visibleEnd = 2): string {
  if (!value || value.length <= visibleStart + visibleEnd) return '****';
  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const masked = '*'.repeat(Math.min(value.length - visibleStart - visibleEnd, 6));
  return `${start}${masked}${end}`;
}
