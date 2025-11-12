# Sprint 3.5: Request/Response Signing - Implementation Tickets

---

## TICKET-3.5-001: Request Signing Service Core

**Story:** US-3.5.1
**Points:** 4 SP
**Priority:** CRITICAL

**Implementation:**

```typescript
// src/modules/signing/request-signing.service.ts

@Injectable()
export class RequestSigningService {
  private readonly logger = new Logger(RequestSigningService.name);
  private readonly TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes

  constructor(
    private readonly signingKeyService: SigningKeyService,
    private readonly nonceService: NonceService,
  ) {}

  /**
   * Verify request signature
   */
  async verifyRequestSignature(
    request: any,
    apiKeyId: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const signature = request.headers['x-signature'];
    const timestamp = request.headers['x-timestamp'];
    const nonce = request.headers['x-nonce'];
    const algorithm = request.headers['x-algorithm'] || 'HMAC-SHA256';

    // Validate header presence
    if (!signature || !timestamp || !nonce) {
      return { valid: false, reason: 'Missing signature headers' };
    }

    // Validate timestamp (prevent delayed injection)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > this.TIMESTAMP_TOLERANCE_SECONDS) {
      return { valid: false, reason: 'Request timestamp too old or too new' };
    }

    // Validate nonce (prevent replay)
    const nonceExists = await this.nonceService.checkAndMarkUsed(nonce, apiKeyId);
    if (nonceExists) {
      return { valid: false, reason: 'Nonce already used (replay attack)' };
    }

    // Get signing key
    const signingKey = await this.signingKeyService.getActiveKey(apiKeyId);
    if (!signingKey) {
      return { valid: false, reason: 'No active signing key for API key' };
    }

    // Calculate expected signature
    const bodyHash = await this.hashBody(request.body);
    const signaturePayload = this.buildSignaturePayload(
      request.method,
      request.path,
      bodyHash,
      timestamp,
      nonce,
    );

    const expectedSignature = crypto
      .createHmac(this.getHashAlgorithm(algorithm), signingKey.decryptedSecret)
      .update(signaturePayload)
      .digest('base64');

    // Compare signatures (constant-time comparison)
    const signatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!signatureValid) {
      this.logger.warn(`Invalid signature for API key ${apiKeyId}`);
      return { valid: false, reason: 'Signature verification failed' };
    }

    return { valid: true };
  }

  /**
   * Generate signature for outbound request (testing)
   */
  generateSignature(
    method: string,
    path: string,
    body: object,
    signingKey: string,
    algorithm: 'HMAC-SHA256' | 'HMAC-SHA512' = 'HMAC-SHA256',
  ): { signature: string; timestamp: number; nonce: string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomUUID();
    const bodyHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(body))
      .digest('base64');

    const signaturePayload = this.buildSignaturePayload(method, path, bodyHash, timestamp.toString(), nonce);

    const signature = crypto
      .createHmac(this.getHashAlgorithm(algorithm), signingKey)
      .update(signaturePayload)
      .digest('base64');

    return { signature, timestamp, nonce };
  }

  private async hashBody(body: any): Promise<string> {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body || {});
    return crypto.createHash('sha256').update(bodyStr).digest('base64');
  }

  private buildSignaturePayload(
    method: string,
    path: string,
    bodyHash: string,
    timestamp: string,
    nonce: string,
  ): string {
    return `${method}|${path}|${bodyHash}|${timestamp}|${nonce}`;
  }

  private getHashAlgorithm(algorithm: string): string {
    return algorithm === 'HMAC-SHA512' ? 'sha512' : 'sha256';
  }
}
```

**Files to Create:**
- `src/modules/signing/request-signing.service.ts`
- `src/modules/signing/services/nonce.service.ts`
- `tests/signing/request-signing.service.spec.ts`

---

## TICKET-3.5-002: Response Signing & Encryption Service

**Story:** US-3.5.2
**Points:** 4 SP
**Priority:** CRITICAL

**Implementation:**

```typescript
// src/modules/signing/response-signing.service.ts

@Injectable()
export class ResponseSigningService {
  private readonly logger = new Logger(ResponseSigningService.name);
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';

  constructor(
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Sign response body
   */
  signResponse(
    body: any,
    signingKey: string,
    requestNonce: string,
  ): { signature: string; timestamp: string; nonceEcho: string } {
    const timestamp = Math.floor(Date.now() / 1000);
    const bodyHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(body))
      .digest('base64');

    const signaturePayload = `${bodyHash}|${timestamp}|${requestNonce}`;

    const signature = crypto
      .createHmac('sha256', signingKey)
      .update(signaturePayload)
      .digest('base64');

    return {
      signature,
      timestamp: timestamp.toString(),
      nonceEcho: requestNonce,
    };
  }

  /**
   * Encrypt sensitive fields in response
   */
  encryptSensitiveFields(
    responseBody: any,
    encryptionKey: string,
    fieldsToEncrypt: string[],
  ): {
    body: any;
    iv: string;
    authTag: string;
  } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ENCRYPTION_ALGORITHM, Buffer.from(encryptionKey), iv);

    // Encrypt specified fields
    const dataToEncrypt = {};
    fieldsToEncrypt.forEach(field => {
      if (field in responseBody) {
        dataToEncrypt[field] = responseBody[field];
        delete responseBody[field];
      }
    });

    const encryptedData = cipher.update(JSON.stringify(dataToEncrypt), 'utf8', 'base64');
    const finalData = encryptedData + cipher.final('base64');
    const authTag = cipher.getAuthTag();

    return {
      body: {
        ...responseBody,
        encryptedFields: finalData,
      },
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  /**
   * Decrypt response (client side reference)
   */
  decryptSensitiveFields(
    encryptedData: string,
    encryptionKey: string,
    iv: string,
    authTag: string,
  ): any {
    const decipher = crypto.createDecipheriv(
      this.ENCRYPTION_ALGORITHM,
      Buffer.from(encryptionKey),
      Buffer.from(iv, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    const decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    const finalData = decrypted + decipher.final('utf8');

    return JSON.parse(finalData);
  }
}
```

**Files to Create:**
- `src/modules/signing/response-signing.service.ts`
- `src/modules/signing/encryption.service.ts`
- `tests/signing/response-signing.service.spec.ts`

---

## TICKET-3.5-003: Signing Guard & Decorator

**Story:** US-3.5.1, US-3.5.2
**Points:** 3 SP
**Priority:** CRITICAL

**Implementation:**

```typescript
// src/modules/signing/signing.guard.ts

@Injectable()
export class SigningGuard implements CanActivate {
  private readonly logger = new Logger(SigningGuard.name);
  private readonly PUBLIC_ENDPOINTS = [
    { method: 'POST', path: '/api/v1/auth/register' },
    { method: 'POST', path: '/api/v1/auth/login' },
    { method: 'POST', path: '/api/v1/auth/verify-email' },
    { method: 'GET', path: '/api/v1/health' },
  ];

  constructor(
    private readonly requestSigningService: RequestSigningService,
    private readonly responseSigningService: ResponseSigningService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Check if endpoint requires signing
    if (this.isPublicEndpoint(request.method, request.path)) {
      return true;
    }

    // Get API key from authentication
    const apiKey = request.user?.apiKeyId;
    if (!apiKey) {
      throw new UnauthorizedException('API key required for signed endpoints');
    }

    // Verify signature
    const result = await this.requestSigningService.verifyRequestSignature(request, apiKey);
    if (!result.valid) {
      throw new BadRequestException({
        error: 'invalid_signature',
        message: result.reason || 'Request signature verification failed',
      });
    }

    // Store signing info in request for response signing later
    request.signingContext = {
      apiKeyId: apiKey,
      requestNonce: request.headers['x-nonce'],
      requestTimestamp: request.headers['x-timestamp'],
    };

    // Intercept response to add signature
    const originalSend = response.send;
    response.send = function (body) {
      // Sign response
      const signature = this.requestSigningService.signResponse(
        body,
        request.user.signingKey,
        request.signingContext.requestNonce,
      );

      // Add signature headers
      response.setHeader('X-Signature', signature.signature);
      response.setHeader('X-Response-Timestamp', signature.timestamp);
      response.setHeader('X-Response-Nonce-Echo', signature.nonceEcho);

      // Call original send
      return originalSend.call(this, body);
    }.bind(response);

    return true;
  }

  private isPublicEndpoint(method: string, path: string): boolean {
    return this.PUBLIC_ENDPOINTS.some(
      ep => ep.method === method && this.pathMatches(ep.path, path),
    );
  }

  private pathMatches(pattern: string, path: string): boolean {
    return pattern === path || path.startsWith(pattern.split(':')[0]);
  }
}

// src/modules/signing/signing.decorator.ts

export function RequireSigning(options: { encryptFields?: string[] } = {}) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('require-signing', options, descriptor.value);
    return descriptor;
  };
}
```

**Files to Create:**
- `src/modules/signing/signing.guard.ts`
- `src/modules/signing/signing.decorator.ts`
- `tests/signing/signing.guard.spec.ts`

---

## TICKET-3.5-004: Webhook Signature Validation

**Story:** US-3.5.3
**Points:** 3 SP
**Priority:** HIGH

**Implementation:**

```typescript
// src/modules/signing/webhook-signing.validator.ts

@Injectable()
export class WebhookSigningValidator {
  private readonly logger = new Logger(WebhookSigningValidator.name);
  private readonly TIMESTAMP_TOLERANCE_SECONDS = 300;

  constructor(
    private readonly merchantService: MerchantService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Validate incoming webhook signature
   */
  async validateWebhookSignature(
    request: any,
    merchantId: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const signature = request.headers['x-webhook-signature'];
    const timestamp = request.headers['x-webhook-timestamp'];
    const webhookId = request.headers['x-webhook-id'];

    // Validate headers
    if (!signature || !timestamp || !webhookId) {
      return { valid: false, reason: 'Missing webhook headers' };
    }

    // Parse signature format: algorithm=value
    const [algorithm, signatureValue] = signature.split('=');
    if (!signatureValue) {
      return { valid: false, reason: 'Invalid signature format' };
    }

    // Validate timestamp
    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    if (Math.abs(now - webhookTime) > this.TIMESTAMP_TOLERANCE_SECONDS) {
      return { valid: false, reason: 'Webhook timestamp too old' };
    }

    // Check idempotency (prevent duplicate processing)
    const alreadyProcessed = await this.idempotencyService.checkIfProcessed(
      merchantId,
      webhookId,
    );
    if (alreadyProcessed) {
      return { valid: false, reason: 'Webhook already processed' };
    }

    // Get merchant signing key
    const merchant = await this.merchantService.findById(merchantId);
    if (!merchant?.webhookSecret) {
      return { valid: false, reason: 'Merchant not found or no webhook secret' };
    }

    // Calculate expected signature
    const rawBody = request.rawBody || JSON.stringify(request.body);
    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac(algorithm === 'sha512' ? 'sha512' : 'sha256', merchant.webhookSecret)
      .update(payload)
      .digest('hex');

    // Compare signatures
    const valid = crypto.timingSafeEqual(
      Buffer.from(signatureValue),
      Buffer.from(expectedSignature),
    );

    if (!valid) {
      this.logger.warn(`Invalid webhook signature from merchant ${merchantId}`);
      return { valid: false, reason: 'Signature verification failed' };
    }

    // Mark as processed
    await this.idempotencyService.markProcessed(merchantId, webhookId);

    return { valid: true };
  }
}
```

**Files to Create:**
- `src/modules/signing/webhook-signing.validator.ts`
- `src/modules/signing/idempotency.service.ts`
- `tests/signing/webhook-signing.validator.spec.ts`

---

## TICKET-3.5-005: Signing Key Management & Rotation

**Story:** US-3.5.4
**Points:** 3 SP
**Priority:** HIGH

**Implementation:**

```typescript
// src/modules/signing/signing-key.service.ts

@Injectable()
export class SigningKeyService {
  private readonly logger = new Logger(SigningKeyService.name);
  private readonly KEY_GRACE_PERIOD_DAYS = 30;

  constructor(
    @InjectRepository(ApiKeySigningKey)
    private readonly repository: Repository<ApiKeySigningKey>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Get active signing key for API key
   */
  async getActiveKey(apiKeyId: string): Promise<ApiKeySigningKey | null> {
    return this.repository.findOne({
      where: { apiKeyId, active: true },
      order: { version: 'DESC' },
    });
  }

  /**
   * Get all valid keys (including grace period)
   */
  async getValidKeys(apiKeyId: string): Promise<ApiKeySigningKey[]> {
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - this.KEY_GRACE_PERIOD_DAYS);

    return this.repository.find({
      where: [
        { apiKeyId, active: true },
        { apiKeyId, expiresAt: MoreThan(gracePeriodEnd) },
      ],
    });
  }

  /**
   * Rotate signing key (create new one)
   */
  async rotateSigningKey(
    apiKeyId: string,
    userId: string,
  ): Promise<ApiKeySigningKey> {
    // Generate new key
    const newSecret = crypto.randomBytes(32).toString('base64');

    // Get current version
    const lastKey = await this.repository.findOne({
      where: { apiKeyId },
      order: { version: 'DESC' },
    });

    const newVersion = (lastKey?.version ?? 0) + 1;

    // Deactivate old key and set expiration
    if (lastKey) {
      lastKey.active = false;
      lastKey.expiresAt = new Date(
        Date.now() + this.KEY_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
      );
      await this.repository.save(lastKey);
    }

    // Create new key
    const newKey = this.repository.create({
      apiKeyId,
      signingKeySecret: this.encryptionService.encrypt(newSecret),
      algorithm: 'HMAC-SHA256',
      version: newVersion,
      active: true,
      createdBy: userId,
    });

    await this.repository.save(newKey);

    this.logger.log(
      `Rotated signing key for API key ${apiKeyId}, new version ${newVersion}`,
    );

    return newKey;
  }

  /**
   * Get decrypted secret (cached, short TTL)
   */
  async getDecryptedSecret(keyId: string): Promise<string> {
    const key = await this.repository.findOne({ where: { id: keyId } });
    if (!key) throw new NotFoundException('Signing key not found');

    return this.encryptionService.decrypt(key.signingKeySecret);
  }
}
```

**Files to Create:**
- `src/modules/signing/signing-key.service.ts`
- `src/modules/signing/entities/api-key-signing-key.entity.ts`
- `tests/signing/signing-key.service.spec.ts`

---

## TICKET-3.5-006: Integration with Payment Endpoints

**Story:** US-3.5.5
**Points:** 2 SP
**Priority:** HIGH

**Description:**
Apply signing guard to all payment endpoints in Sprints 5-6.

**Implementation:**

```typescript
// Example in payment controller

@Post('/card/initialize')
@UseGuards(SigningGuard)
@RequireSigning({ encryptFields: ['cardToken', 'cvv'] })
async initializeCardPayment(
  @Body() dto: CardPaymentInitializeDto,
  @Req() request: any,
): Promise<CardPaymentInitializeResponseDto> {
  // Handler implementation
}

@Post('/transfers/p2p')
@UseGuards(SigningGuard)
async p2pTransfer(
  @Body() dto: P2PTransferDto,
  @Req() request: any,
): Promise<TransferResponseDto> {
  // Handler implementation
}
```

---

## Integration Checklist

- [ ] All request headers validated before processing
- [ ] Signature verification latency: <5ms
- [ ] Response signature latency: <5ms
- [ ] Encryption/decryption: <10ms
- [ ] Key rotation: 0 service disruption
- [ ] Grace period: 30 days for old keys
- [ ] Audit logging: All events recorded
- [ ] Documentation: Complete with examples
- [ ] Load testing: 1000+ requests/sec verified
