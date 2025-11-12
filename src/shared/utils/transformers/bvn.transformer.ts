import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

// Validate environment variables
if (!process.env.BVN_ENCRYPTION_ALGORITHM || !process.env.BVN_ENCRYPTION_KEY) {
  throw new Error(
    'BVN_ENCRYPTION_ALGORITHM and BVN_ENCRYPTION_KEY must be set in environment variables',
  );
}

const algorithm = String(process.env.BVN_ENCRYPTION_ALGORITHM);
const key = crypto
  .createHash('sha256')
  .update(String(process.env.BVN_ENCRYPTION_KEY))
  .digest('base64')
  .substring(0, 32);

// Use a delimiter that won't appear in base64
const DELIMITER = ':fci:';

export class BvnEncryptionTransformer implements ValueTransformer {
  to(value: string | null): string | null {
    if (!value) return null;

    try {
      // Validate that BVN is complete (11 digits)
      if (value.length !== 11 || !/^\d{11}$/.test(value)) {
        throw new Error('Invalid BVN: must be exactly 11 digits');
      }

      // Generate random IV for each encryption
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, key, iv) as crypto.CipherGCM;
      let encrypted = cipher.update(value, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag for GCM mode
      const authTag = cipher.getAuthTag();

      // Store IV + authTag + encrypted data (IV:fci:authTag:fci:encrypted)
      return iv.toString('base64') + DELIMITER + authTag.toString('base64') + DELIMITER + encrypted;
    } catch (error) {
      throw new Error(`Failed to encrypt BVN: ${error.message}`);
    }
  }

  from(value: string | null): string | null {
    if (!value) return null;

    try {
      const parts = value.split(DELIMITER);

      // New format: IV:fci:authTag:fci:encrypted (3 parts)
      if (parts.length === 3) {
        const iv = Buffer.from(parts[0], 'base64');
        const authTag = Buffer.from(parts[1], 'base64');
        const encryptedData = parts[2];

        const decipher = crypto.createDecipheriv(algorithm, key, iv) as crypto.DecipherGCM;
        decipher.setAuthTag(authTag); // Required for GCM mode

        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }

      // Old format: IV:fci:encrypted (2 parts) - for backward compatibility
      // This will fail for GCM but kept for data migration scenarios
      if (parts.length === 2) {
        console.warn(
          'BvnEncryptionTransformer: Decrypting old format BVN. Consider re-encrypting with new format.',
        );
        const iv = Buffer.from(parts[0], 'base64');
        const encryptedData = parts[1];

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }

      throw new Error('Invalid encrypted BVN format');
    } catch (error) {
      throw new Error(`Failed to decrypt BVN: ${error.message}`);
    }
  }
}
