/**
 * PII Decrypt Middleware
 *
 * The frontend `piiEncrypt.ts` utility encrypts sensitive fields (mobile, PAN,
 * Aadhaar, email, password, etc.) with AES before every API call and injects
 * `__pii_encrypted: true` into the request body.
 *
 * This middleware detects that flag, walks the body recursively, and decrypts
 * every known PII field back to plaintext before the request reaches any
 * controller. Controllers therefore need zero changes.
 *
 * Encryption algorithm: CryptoJS.AES (AES-256-CBC with random IV, OpenSSL
 * format) — identical to the `encryptData` / `decryptData` functions in
 * `encryptDecrypt-service.ts`.
 *
 * Register in `app.ts` AFTER bodyParser and BEFORE routes:
 *   import { piiDecryptMiddleware } from './middlewares/piiDecrypt.middleware';
 *   app.use(piiDecryptMiddleware);
 */

import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';
import configs from '../config/config';
import environment from '../environment';

const config = (configs as { [key: string]: any })[environment];

// Must match the `PII_SECRET` constant in the frontend `piiEncrypt.ts`
// and the `cryptoKey` used by `encryptData` / `decryptData`.
const PII_SECRET: string = config.cryptoKey || 'va*proses';

// ─── Field names that carry PII ──────────────────────────────────────────────
const PII_FIELDS = new Set([
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
  'userName',
  'username',
  'account_number',
  'bank_account_number',
  'accountNumber',
  'ifsc',
  'ifsc_code',
  'dob',
  'date_of_birth',
  'password',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decryptValue(cipher: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, PII_SECRET);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    if (!plain) throw new Error('Empty plaintext after decryption');
    return plain;
  } catch {
    // Return the original value unchanged so a malformed / already-plain field
    // doesn't break the request. Logs a warning for visibility.
    console.warn('[piiDecrypt] Failed to decrypt field — leaving as-is');
    return cipher;
  }
}

/**
 * Recursively walk an object and decrypt every PII field.
 * The `__pii_encrypted` sentinel key is removed after processing.
 */
function decryptPIIFields(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(decryptPIIFields);
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '__pii_encrypted') {
      // Strip the sentinel – do not pass it to controllers
      continue;
    }

    if (PII_FIELDS.has(key) && typeof value === 'string' && value.trim() !== '') {
      result[key] = decryptValue(value);
    } else if (value && typeof value === 'object') {
      result[key] = decryptPIIFields(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export const piiDecryptMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Only process JSON bodies that carry the PII-encrypted flag.
    if (
      req.body &&
      typeof req.body === 'object' &&
      req.body.__pii_encrypted === true
    ) {
      req.body = decryptPIIFields(req.body);
    }
  } catch (err) {
    // Never block a request due to decryption failure – log and continue.
    console.error('[piiDecrypt] Unexpected error during PII decryption:', err);
  }

  next();
};
