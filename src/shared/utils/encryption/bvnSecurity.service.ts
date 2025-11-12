import { Injectable, Logger } from '@nestjs/common';
import { Argon2HashingUtil } from '../hashing/argon2.utils';
import { RandomnessUtil } from './randomness.util';
import * as crypto from 'crypto';

export interface BvnDerivedKeys {
  salt: string;
  cypher: string;
  derivedKey: string;
}

/**
 * Service for deriving cryptographic keys from BVN using Argon2
 * This ensures that customer encryption keys are derived from their BVN
 * making the security model tied to their verified identity
 */
@Injectable()
export class BvnSecurityService {
  private readonly logger = new Logger(BvnSecurityService.name);

  constructor(
    private readonly argon2Util: Argon2HashingUtil,
    private readonly randomnessUtil: RandomnessUtil,
  ) {}

  /**
   * Derive cryptographic keys from BVN using Argon2
   *
   * @param bvn - The plain text BVN (11 digits)
   * @param profileId - Unique customer identifier to ensure salt uniqueness
   * @returns Object containing salt, cypher, and derived key
   *
   * Security model:
   * 1. Generate a random salt unique to this customer (using profileId)
   * 2. Use Argon2 to derive a master key from BVN + salt
   * 3. Derive salt (for password hashing) from master key
   * 4. Derive cypher (for data encryption) from master key
   */
  async deriveBvnKeys(bvn: string, profileId: string): Promise<BvnDerivedKeys> {
    this.logger.log(`Deriving encryption keys from BVN for profile: ${profileId}`);

    // Validate BVN format
    if (!bvn || bvn.length !== 11 || !/^\d{11}$/.test(bvn)) {
      throw new Error('Invalid BVN: must be exactly 11 digits');
    }

    // Generate a deterministic but unique salt for this customer
    // Uses profileId to ensure each customer has a unique salt
    const customerSalt = crypto.createHash('sha256').update(`${profileId}:bvn-salt`).digest();

    // Derive master key from BVN using Argon2
    // This is the most CPU-intensive operation, providing strong protection
    const masterKey = await this.argon2Util.deriveKey(
      bvn,
      customerSalt,
      64, // 64 bytes = 512 bits
    );

    // Split master key into two parts for different purposes
    const saltKey = masterKey.subarray(0, 32); // First 32 bytes for salt derivation
    const cypherKey = masterKey.subarray(32, 64); // Last 32 bytes for cypher derivation

    // Generate the salt (for password hashing)
    // This is derived from BVN, so it's consistent but unpredictable
    const salt = crypto
      .createHash('sha256')
      .update(saltKey)
      .update(`${profileId}:salt`)
      .digest('hex');

    // Generate the cypher (for data encryption)
    // Also derived from BVN, ensuring encryption is tied to verified identity
    const cypher = crypto
      .createHash('sha256')
      .update(cypherKey)
      .update(`${profileId}:cypher`)
      .digest('hex');

    // Derive a general-purpose encryption key
    const derivedKey = crypto
      .createHash('sha256')
      .update(masterKey)
      .update(`${profileId}:derived-key`)
      .digest('hex');

    this.logger.log(`Successfully derived encryption keys for profile: ${profileId}`);

    return {
      salt,
      cypher,
      derivedKey,
    };
  }

  /**
   * Verify that the provided BVN can derive the expected salt
   * Useful for authentication and verification scenarios
   */
  async verifyBvnDerivedSalt(
    bvn: string,
    profileId: string,
    expectedSalt: string,
  ): Promise<boolean> {
    try {
      const derived = await this.deriveBvnKeys(bvn, profileId);
      return derived.salt === expectedSalt;
    } catch (error) {
      this.logger.error(`BVN verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Re-derive keys from BVN (useful if customer needs key recovery)
   * This demonstrates that keys can always be recovered from BVN
   */
  async recoverKeys(bvn: string, profileId: string): Promise<BvnDerivedKeys> {
    this.logger.log(`Recovering encryption keys from BVN for profile: ${profileId}`);
    return await this.deriveBvnKeys(bvn, profileId);
  }
}
