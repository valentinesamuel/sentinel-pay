# 🔒 Security Implementation Guide

This guide provides step-by-step instructions with pseudo code for implementing all critical security features in the payment platform.

---

## Table of Contents

1. [Field-Level Encryption](#1-field-level-encryption)
2. [Database Connection Security](#2-database-connection-security)
3. [Redis Security](#3-redis-security)
4. [MinIO/S3 Security](#4-minios3-security)
5. [File Upload Security](#5-file-upload-security)
6. [Row-Level Security](#6-row-level-security)
7. [Query Protection](#7-query-protection)
8. [Memory & Resource Limits](#8-memory--resource-limits)
9. [Webhook Signature Verification](#9-webhook-signature-verification)
10. [Transaction Signing](#10-transaction-signing)
11. [Docker Security Hardening](#11-docker-security-hardening)
12. [Network Isolation](#12-network-isolation)
13. [Secrets Rotation](#13-secrets-rotation)
14. [Geo-Blocking](#14-geo-blocking)
15. [Health Checks](#15-health-checks)
16. [Graceful Shutdown](#16-graceful-shutdown)
17. [WAF Rules (Mock)](#17-waf-rules-mock)

---

## 1. Field-Level Encryption

### Overview
Encrypt sensitive fields (BVN, NIN, SSN) in the database so even with DB access, data is unreadable.

### Why It's Needed
- Protects against database breaches
- Compliance requirement (PCI DSS, GDPR)
- Defense-in-depth strategy

### Implementation

#### Step 1: Create Encryption Utility

**Location:** `libs/shared/src/utils/field-encryption.util.ts`

```typescript
// PSEUDO CODE

class FieldEncryption {
  algorithm = 'aes-256-gcm'

  function encrypt(plaintext, masterKey) {
    // 1. Generate random salt (16 bytes)
    salt = generateRandomBytes(16)

    // 2. Derive encryption key from master key + salt
    // Uses scrypt for key derivation (CPU-intensive, prevents brute force)
    encryptionKey = deriveKey(masterKey, salt, 32)

    // 3. Generate initialization vector (16 bytes)
    iv = generateRandomBytes(16)

    // 4. Create cipher with AES-256-GCM
    cipher = createCipher(algorithm, encryptionKey, iv)

    // 5. Encrypt the plaintext
    encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // 6. Get authentication tag (for integrity verification)
    authTag = cipher.getAuthTag()

    // 7. Combine all parts: salt:iv:authTag:encrypted
    return join([salt, iv, authTag, encrypted], ':')
  }

  function decrypt(ciphertext, masterKey) {
    // 1. Split the ciphertext into components
    [salt, iv, authTag, encrypted] = split(ciphertext, ':')

    // 2. Derive the same encryption key
    encryptionKey = deriveKey(masterKey, salt, 32)

    // 3. Create decipher
    decipher = createDecipher(algorithm, encryptionKey, iv)

    // 4. Set authentication tag (verifies integrity)
    decipher.setAuthTag(authTag)

    // 5. Decrypt
    decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}

// Helper: Key derivation
function deriveKey(masterKey, salt, keyLength) {
  // scrypt is CPU-intensive (prevents brute force)
  // N = 16384 (CPU cost)
  // r = 8 (block size)
  // p = 1 (parallelization)
  return scrypt(masterKey, salt, keyLength, {N: 16384, r: 8, p: 1})
}
```

#### Step 2: Apply to Entity Fields

**Location:** `apps/payment-api/src/modules/users/entities/user.entity.ts`

```typescript
// PSEUDO CODE

@Entity()
class User {
  @Column()
  email: string  // Not encrypted (searchable)

  @Column({
    type: 'text',
    transformer: {
      // Encrypt before saving to database
      to: (value) => {
        if (!value) return value
        return fieldEncryption.encrypt(value, ENCRYPTION_KEY)
      },
      // Decrypt when loading from database
      from: (value) => {
        if (!value) return value
        return fieldEncryption.decrypt(value, ENCRYPTION_KEY)
      }
    }
  })
  bvn: string  // Encrypted in DB, plain in memory

  @Column({
    type: 'text',
    transformer: {
      to: (value) => value ? fieldEncryption.encrypt(value, ENCRYPTION_KEY) : value,
      from: (value) => value ? fieldEncryption.decrypt(value, ENCRYPTION_KEY) : value
    }
  })
  nin: string  // Encrypted in DB
}
```

#### Step 3: Environment Configuration

**Location:** `.env`

```bash
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=your-base64-encoded-32-byte-key-here
```

#### Step 4: Testing

```typescript
// PSEUDO CODE

describe('Field Encryption', () => {
  test('should encrypt and decrypt correctly', () => {
    plaintext = "12345678901"

    encrypted = fieldEncryption.encrypt(plaintext, ENCRYPTION_KEY)

    // Should not contain plaintext
    assert(encrypted !== plaintext)
    assert(!encrypted.includes(plaintext))

    // Should decrypt back to original
    decrypted = fieldEncryption.decrypt(encrypted, ENCRYPTION_KEY)
    assert(decrypted === plaintext)
  })

  test('should use different IV each time', () => {
    plaintext = "12345678901"

    encrypted1 = fieldEncryption.encrypt(plaintext, ENCRYPTION_KEY)
    encrypted2 = fieldEncryption.encrypt(plaintext, ENCRYPTION_KEY)

    // Same plaintext, but different ciphertext (due to different IV)
    assert(encrypted1 !== encrypted2)
  })

  test('should fail with wrong key', () => {
    plaintext = "12345678901"
    encrypted = fieldEncryption.encrypt(plaintext, ENCRYPTION_KEY)

    wrongKey = "different-key"
    assertThrows(() => {
      fieldEncryption.decrypt(encrypted, wrongKey)
    })
  })

  test('should detect tampering', () => {
    plaintext = "12345678901"
    encrypted = fieldEncryption.encrypt(plaintext, ENCRYPTION_KEY)

    // Tamper with ciphertext
    tamperedEncrypted = encrypted.replace('a', 'b')

    // Should fail authentication
    assertThrows(() => {
      fieldEncryption.decrypt(tamperedEncrypted, ENCRYPTION_KEY)
    })
  })
})
```

---

## 2. Database Connection Security

### Overview
Enable SSL/TLS for database connections and configure connection pooling limits.

### Why It's Needed
- Prevents eavesdropping on database traffic
- Prevents man-in-the-middle attacks
- Required for compliance (PCI DSS)

### Implementation

#### Step 1: Generate SSL Certificates (Development)

```bash
# PSEUDO CODE

# Generate CA certificate
openssl req -new -x509 -days 365 -nodes \
  -out certs/postgres-ca.crt \
  -keyout certs/postgres-ca.key \
  -subj "/CN=PostgreSQL CA"

# Generate server certificate
openssl req -new -nodes \
  -out certs/postgres-server.csr \
  -keyout certs/postgres-server.key \
  -subj "/CN=localhost"

# Sign server certificate with CA
openssl x509 -req -in certs/postgres-server.csr \
  -days 365 -CA certs/postgres-ca.crt \
  -CAkey certs/postgres-ca.key \
  -out certs/postgres-server.crt \
  -CAcreateserial

# Set permissions
chmod 600 certs/postgres-server.key
```

#### Step 2: Configure PostgreSQL for SSL

**Location:** `infrastructure/docker/postgres/postgresql.conf`

```ini
# PSEUDO CODE

# Enable SSL
ssl = on
ssl_cert_file = '/var/lib/postgresql/certs/postgres-server.crt'
ssl_key_file = '/var/lib/postgresql/certs/postgres-server.key'
ssl_ca_file = '/var/lib/postgresql/certs/postgres-ca.crt'

# Force SSL for all connections
ssl_min_protocol_version = 'TLSv1.3'

# Connection limits
max_connections = 100
```

#### Step 3: Update Docker Compose

**Location:** `docker-compose.yml`

```yaml
# PSEUDO CODE

services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - ./certs:/var/lib/postgresql/certs:ro
      - ./infrastructure/docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    environment:
      POSTGRES_USER: payment_user
      POSTGRES_PASSWORD: payment_pass
      POSTGRES_DB: payment_db
```

#### Step 4: Configure TypeORM with SSL

**Location:** `apps/payment-api/src/config/database.config.ts`

```typescript
// PSEUDO CODE

function getDatabaseConfig() {
  isProduction = process.env.NODE_ENV === 'production'

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,

    // SSL Configuration
    ssl: isProduction ? {
      rejectUnauthorized: true,
      ca: readFileSync('./certs/postgres-ca.crt').toString(),
      cert: readFileSync('./certs/postgres-client.crt').toString(),
      key: readFileSync('./certs/postgres-client.key').toString()
    } : false,

    // Connection Pool Configuration
    extra: {
      max: 10,              // Maximum pool size
      min: 2,               // Minimum pool size
      idleTimeoutMillis: 30000,  // Close idle connections after 30s
      connectionTimeoutMillis: 10000,  // Timeout after 10s

      // Query timeout (prevent long-running queries)
      statement_timeout: 30000,  // 30 seconds
      query_timeout: 20000,      // 20 seconds

      // Application name for tracking
      application_name: 'payment-api'
    },

    // Logging
    logging: isProduction ? ['error'] : 'all',

    // Never auto-sync in production
    synchronize: false,

    // Use migrations
    migrations: ['dist/migrations/*.js'],
    migrationsRun: true
  }
}
```

#### Step 5: Test SSL Connection

```typescript
// PSEUDO CODE

describe('Database SSL Connection', () => {
  test('should connect with SSL', async () => {
    connection = await createConnection(databaseConfig)

    // Verify SSL is active
    result = await connection.query("SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()")

    assert(result[0].ssl === true, "SSL not enabled")

    await connection.close()
  })

  test('should reject connection without SSL in production', async () => {
    configWithoutSSL = {...databaseConfig, ssl: false}

    if (isProduction) {
      await assertThrows(async () => {
        await createConnection(configWithoutSSL)
      })
    }
  })

  test('should timeout long-running queries', async () => {
    connection = await createConnection(databaseConfig)

    // This should timeout after 30 seconds
    await assertThrows(async () => {
      await connection.query("SELECT pg_sleep(60)")
    }, 'QueryTimeoutError')
  })
})
```

---

## 3. Redis Security

### Overview
Enable password authentication and TLS for Redis connections.

### Why It's Needed
- Redis has no authentication by default
- Prevents unauthorized access
- Encrypts data in transit

### Implementation

#### Step 1: Configure Redis with Password

**Location:** `infrastructure/docker/redis/redis.conf`

```conf
# PSEUDO CODE

# Enable password authentication
requirepass your-strong-redis-password-here

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
rename-command SHUTDOWN ""
rename-command DEBUG ""
rename-command KEYS ""

# Memory limits
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
appendonly yes
appendfsync everysec

# Network
bind 0.0.0.0
protected-mode yes
port 6379

# TLS/SSL (production)
# tls-port 6380
# tls-cert-file /etc/redis/certs/redis.crt
# tls-key-file /etc/redis/certs/redis.key
# tls-ca-cert-file /etc/redis/certs/ca.crt
```

#### Step 2: Update Docker Compose

**Location:** `docker-compose.yml`

```yaml
# PSEUDO CODE

services:
  redis:
    image: redis:7-alpine
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - ./infrastructure/docker/redis/redis.conf:/usr/local/etc/redis/redis.conf
      - redis_data:/data
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
```

#### Step 3: Configure Redis Client

**Location:** `apps/payment-api/src/config/redis.config.ts`

```typescript
// PSEUDO CODE

function getRedisConfig() {
  isProduction = process.env.NODE_ENV === 'production'

  return {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),

    // Password authentication
    password: process.env.REDIS_PASSWORD,

    // TLS (production only)
    tls: isProduction ? {
      rejectUnauthorized: true,
      ca: readFileSync('./certs/redis-ca.crt')
    } : undefined,

    // Connection settings
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    enableReadyCheck: true,
    enableOfflineQueue: false,

    // Key prefix (namespace)
    keyPrefix: 'payment-api:',

    // Retry strategy
    retryStrategy: (times) => {
      if (times > 3) {
        return null  // Stop retrying
      }
      delay = Math.min(times * 1000, 3000)
      return delay
    },

    // Reconnect on error
    reconnectOnError: (err) => {
      targetError = 'READONLY'
      if (err.message.includes(targetError)) {
        return true  // Reconnect
      }
      return false
    }
  }
}
```

#### Step 4: Environment Variables

**Location:** `.env`

```bash
# PSEUDO CODE

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-strong-password-here
```

#### Step 5: Testing

```typescript
// PSEUDO CODE

describe('Redis Security', () => {
  test('should require password', async () => {
    configWithoutPassword = {...redisConfig, password: undefined}

    await assertThrows(async () => {
      client = await createRedisClient(configWithoutPassword)
      await client.ping()
    }, 'NOAUTH Authentication required')
  })

  test('should reject wrong password', async () => {
    configWithWrongPassword = {...redisConfig, password: 'wrong-password'}

    await assertThrows(async () => {
      client = await createRedisClient(configWithWrongPassword)
      await client.ping()
    }, 'ERR invalid password')
  })

  test('should connect with correct password', async () => {
    client = await createRedisClient(redisConfig)
    response = await client.ping()

    assert(response === 'PONG')

    await client.disconnect()
  })

  test('dangerous commands should be disabled', async () => {
    client = await createRedisClient(redisConfig)

    await assertThrows(async () => {
      await client.flushdb()
    }, 'unknown command')

    await assertThrows(async () => {
      await client.config('GET', '*')
    }, 'unknown command')
  })
})
```

---

## 4. MinIO/S3 Security

### Overview
Implement bucket policies, signed URLs, and server-side encryption for file storage.

### Why It's Needed
- Prevents unauthorized file access
- Encrypts files at rest
- Temporary access with signed URLs

### Implementation

#### Step 1: Create Storage Service

**Location:** `apps/payment-api/src/modules/storage/storage.service.ts`

```typescript
// PSEUDO CODE

class StorageService {
  minioClient = null

  function initialize() {
    minioClient = createMinIOClient({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    })

    setupBuckets()
  }

  async function setupBuckets() {
    buckets = ['kyc-documents', 'transaction-receipts', 'audit-logs']

    for each bucket in buckets {
      // Create bucket if not exists
      exists = await minioClient.bucketExists(bucket)
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1')
      }

      // Set strict bucket policy (no public access)
      policy = {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Deny",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": [`arn:aws:s3:::${bucket}/*`]
          }
        ]
      }

      await minioClient.setBucketPolicy(bucket, JSON.stringify(policy))

      // Enable versioning
      await minioClient.setBucketVersioning(bucket, {Status: 'Enabled'})
    }
  }

  async function uploadFile(bucket, file, userId, metadata) {
    // Generate unique key
    timestamp = Date.now()
    randomSuffix = generateRandomBytes(16).toString('hex')
    sanitizedFilename = sanitizeFilename(file.originalname)
    key = `${timestamp}-${randomSuffix}-${sanitizedFilename}`

    // Metadata for tracking
    fileMetadata = {
      'Content-Type': file.mimetype,
      'x-amz-server-side-encryption': 'AES256',  // Server-side encryption
      'x-amz-meta-user-id': userId,
      'x-amz-meta-uploaded-at': new Date().toISOString(),
      'x-amz-meta-original-name': file.originalname,
      'x-amz-meta-file-hash': calculateHash(file.buffer),
      ...metadata
    }

    // Upload with encryption
    await minioClient.putObject(
      bucket,
      key,
      file.buffer,
      file.size,
      fileMetadata
    )

    return key
  }

  async function getSignedUrl(bucket, key, userId, expirySeconds = 3600) {
    // Verify ownership
    metadata = await minioClient.statObject(bucket, key)

    if (metadata.metaData['x-amz-meta-user-id'] !== userId) {
      throw new Error('Access denied: Not file owner')
    }

    // Generate signed URL (expires in 1 hour)
    signedUrl = await minioClient.presignedGetObject(
      bucket,
      key,
      expirySeconds
    )

    return signedUrl
  }

  async function deleteFile(bucket, key, userId) {
    // Verify ownership
    metadata = await minioClient.statObject(bucket, key)

    if (metadata.metaData['x-amz-meta-user-id'] !== userId) {
      throw new Error('Access denied: Not file owner')
    }

    // Soft delete (move to deleted prefix)
    await minioClient.copyObject(
      bucket,
      `deleted/${key}`,
      `/${bucket}/${key}`
    )

    // Remove original
    await minioClient.removeObject(bucket, key)
  }

  function sanitizeFilename(filename) {
    // Remove path traversal
    filename = filename.replace(/\.\./g, '')

    // Keep only safe characters
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')

    // Limit length
    if (filename.length > 255) {
      extension = filename.split('.').pop()
      filename = filename.substring(0, 250) + '.' + extension
    }

    return filename
  }

  function calculateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex')
  }
}
```

#### Step 2: Usage in Controller

```typescript
// PSEUDO CODE

@Controller('kyc')
class KYCController {

  @Post('documents')
  @UseInterceptors(FileInterceptor('file'))
  async function uploadDocument(
    file,  // Validated by FileValidationPipe
    currentUser
  ) {
    // Upload to MinIO
    key = await storageService.uploadFile(
      'kyc-documents',
      file,
      currentUser.id,
      {
        'document-type': file.fieldname,
        'kyc-level': 'tier-3'
      }
    )

    // Save reference in database
    document = await kycDocumentRepository.create({
      userId: currentUser.id,
      type: file.fieldname,
      storageKey: key,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      hash: file.hash
    })

    return {
      id: document.id,
      type: document.type,
      uploadedAt: document.createdAt
    }
  }

  @Get('documents/:id')
  async function getDocument(documentId, currentUser) {
    // Get document from database
    document = await kycDocumentRepository.findOne({
      where: {id: documentId}
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    // Verify ownership
    if (document.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied')
    }

    // Generate signed URL (expires in 1 hour)
    signedUrl = await storageService.getSignedUrl(
      'kyc-documents',
      document.storageKey,
      currentUser.id,
      3600  // 1 hour
    )

    return {
      id: document.id,
      downloadUrl: signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }
  }
}
```

#### Step 3: Testing

```typescript
// PSEUDO CODE

describe('Storage Security', () => {
  test('should upload file with encryption', async () => {
    file = createMockFile('test.pdf', 'application/pdf')

    key = await storageService.uploadFile('kyc-documents', file, 'user-123', {})

    // Verify metadata
    metadata = await minioClient.statObject('kyc-documents', key)

    assert(metadata.metaData['x-amz-server-side-encryption'] === 'AES256')
    assert(metadata.metaData['x-amz-meta-user-id'] === 'user-123')
  })

  test('should generate signed URL for owner only', async () => {
    file = createMockFile('test.pdf', 'application/pdf')
    key = await storageService.uploadFile('kyc-documents', file, 'user-123', {})

    // Owner should get signed URL
    signedUrl = await storageService.getSignedUrl('kyc-documents', key, 'user-123')
    assert(signedUrl !== null)

    // Non-owner should be denied
    await assertThrows(async () => {
      await storageService.getSignedUrl('kyc-documents', key, 'user-456')
    }, 'Access denied')
  })

  test('should soft delete files', async () => {
    file = createMockFile('test.pdf', 'application/pdf')
    key = await storageService.uploadFile('kyc-documents', file, 'user-123', {})

    await storageService.deleteFile('kyc-documents', key, 'user-123')

    // Original should be gone
    await assertThrows(async () => {
      await minioClient.statObject('kyc-documents', key)
    }, 'NotFound')

    // Should exist in deleted folder
    metadata = await minioClient.statObject('kyc-documents', `deleted/${key}`)
    assert(metadata !== null)
  })
})
```

---

## 5. File Upload Security

### Overview
Validate file types, check for malware, limit file sizes.

### Why It's Needed
- Prevents malicious file uploads
- Prevents DoS via large files
- Prevents XSS via SVG/HTML uploads

### Implementation

#### Step 1: Create File Validation Pipe

**Location:** `apps/payment-api/src/common/pipes/file-validation.pipe.ts`

```typescript
// PSEUDO CODE

class FileValidationPipe {
  allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
  ]

  maxFileSize = 5 * 1024 * 1024  // 5MB

  async function transform(file) {
    if (!file) {
      throw new Error('File is required')
    }

    // 1. Check file size
    if (file.size > maxFileSize) {
      throw new Error('File size exceeds 5MB limit')
    }

    // 2. Verify actual file type (not just extension)
    // This prevents attacks where .exe is renamed to .jpg
    actualType = await detectFileType(file.buffer)

    if (!actualType || !allowedMimeTypes.includes(actualType.mime)) {
      throw new Error('Invalid file type. Only JPEG, PNG, PDF allowed')
    }

    // 3. Check file extension matches MIME type
    extension = getFileExtension(file.originalname)
    expectedExtensions = getExpectedExtensions(actualType.mime)

    if (!expectedExtensions.includes(extension)) {
      throw new Error('File extension does not match file type')
    }

    // 4. Scan for malicious content
    if (containsMaliciousContent(file.buffer, actualType.mime)) {
      throw new Error('File contains suspicious content')
    }

    // 5. Check image dimensions (for images)
    if (actualType.mime.startsWith('image/')) {
      dimensions = await getImageDimensions(file.buffer)

      if (dimensions.width > 10000 || dimensions.height > 10000) {
        throw new Error('Image dimensions too large')
      }
    }

    // 6. Sanitize filename
    file.originalname = sanitizeFilename(file.originalname)

    // 7. Calculate hash (for deduplication & integrity)
    file.hash = calculateSHA256(file.buffer)

    // 8. Add validated flag
    file.validated = true

    return file
  }

  async function detectFileType(buffer) {
    // Read file signature (magic bytes)
    // JPEG: FF D8 FF
    // PNG: 89 50 4E 47
    // PDF: 25 50 44 46

    return fileTypeFromBuffer(buffer)
  }

  function containsMaliciousContent(buffer, mimeType) {
    // Convert to string for scanning (first 1KB)
    content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024))

    dangerousPatterns = [
      /<script/i,           // JavaScript
      /<\?php/i,           // PHP
      /<%/,                // ASP/JSP
      /javascript:/i,      // JavaScript protocol
      /on\w+\s*=/i,       // Event handlers (onclick, onerror, etc.)
      /eval\(/i,          // eval()
      /document\./i,      // DOM manipulation
      /window\./i,        // Window object
    ]

    for each pattern in dangerousPatterns {
      if (pattern.test(content)) {
        logSecurityEvent('MALICIOUS_FILE_UPLOAD_ATTEMPT', {
          pattern: pattern.toString(),
          mimeType: mimeType
        })
        return true
      }
    }

    // Check for embedded scripts in PDF
    if (mimeType === 'application/pdf') {
      if (content.includes('/JavaScript') || content.includes('/JS')) {
        return true
      }
    }

    // Check for polyglot files (valid in multiple formats)
    if (isPolyglot(buffer)) {
      return true
    }

    return false
  }

  function sanitizeFilename(filename) {
    // Remove directory traversal attempts
    filename = filename.replace(/\.\./g, '')
    filename = filename.replace(/\//g, '_')
    filename = filename.replace(/\\/g, '_')

    // Remove null bytes
    filename = filename.replace(/\0/g, '')

    // Keep only safe characters
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')

    // Limit length
    if (filename.length > 255) {
      extension = filename.split('.').pop()
      basename = filename.substring(0, 250)
      filename = basename + '.' + extension
    }

    // Ensure it has an extension
    if (!filename.includes('.')) {
      throw new Error('Filename must have an extension')
    }

    return filename
  }

  function isPolyglot(buffer) {
    // Check if file is valid in multiple formats
    // (common attack technique)

    validFormats = []

    if (isValidJPEG(buffer)) validFormats.push('JPEG')
    if (isValidPNG(buffer)) validFormats.push('PNG')
    if (isValidGIF(buffer)) validFormats.push('GIF')
    if (isValidPDF(buffer)) validFormats.push('PDF')
    if (isValidHTML(buffer)) validFormats.push('HTML')

    // If valid in more than one format, suspicious
    return validFormats.length > 1
  }
}
```

#### Step 2: Multer Configuration

**Location:** `apps/payment-api/src/config/multer.config.ts`

```typescript
// PSEUDO CODE

function getMulterConfig() {
  return {
    // Memory storage (don't write to disk)
    storage: memoryStorage(),

    // File filter
    fileFilter: (req, file, callback) => {
      // Check MIME type from header
      allowedMimes = ['image/jpeg', 'image/png', 'application/pdf']

      if (!allowedMimes.includes(file.mimetype)) {
        callback(new Error('Invalid file type'), false)
      } else {
        callback(null, true)
      }
    },

    // Size limit
    limits: {
      fileSize: 5 * 1024 * 1024,  // 5MB
      files: 1,  // Max 1 file per request
      fields: 10,  // Max 10 fields
      parts: 20   // Max 20 parts
    }
  }
}
```

#### Step 3: Usage in Controller

```typescript
// PSEUDO CODE

@Controller('kyc')
class KYCController {

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('document', getMulterConfig())
  )
  async function uploadDocument(
    @UploadedFile(FileValidationPipe) file,
    @CurrentUser() user
  ) {
    // File is validated by pipe

    // Additional business logic validation
    if (await hasReachedUploadLimit(user.id)) {
      throw new Error('Upload limit reached for today')
    }

    // Upload to storage
    key = await storageService.uploadFile('kyc-documents', file, user.id, {})

    // Save to database
    document = await saveDocument(user.id, file, key)

    return {
      id: document.id,
      status: 'uploaded',
      filename: file.originalname
    }
  }
}
```

#### Step 4: Testing

```typescript
// PSEUDO CODE

describe('File Upload Security', () => {
  test('should reject files over size limit', async () => {
    largeFile = createFile(6 * 1024 * 1024)  // 6MB

    await assertThrows(async () => {
      await fileValidationPipe.transform(largeFile)
    }, 'File size exceeds 5MB limit')
  })

  test('should reject file type mismatch', async () => {
    // .exe file renamed to .jpg
    exeFile = readFile('malware.exe')
    exeFile.originalname = 'image.jpg'
    exeFile.mimetype = 'image/jpeg'

    await assertThrows(async () => {
      await fileValidationPipe.transform(exeFile)
    }, 'Invalid file type')
  })

  test('should reject files with scripts', async () => {
    maliciousSVG = createFile(`
      <svg onload="alert('XSS')">
        <script>alert('XSS')</script>
      </svg>
    `)
    maliciousSVG.originalname = 'image.svg'

    await assertThrows(async () => {
      await fileValidationPipe.transform(maliciousSVG)
    }, 'File contains suspicious content')
  })

  test('should sanitize filename', async () => {
    file = createFile('test.pdf')
    file.originalname = '../../../etc/passwd'

    validatedFile = await fileValidationPipe.transform(file)

    assert(!validatedFile.originalname.includes('..'))
    assert(!validatedFile.originalname.includes('/'))
  })

  test('should calculate file hash', async () => {
    file = createFile('test.pdf')

    validatedFile = await fileValidationPipe.transform(file)

    assert(validatedFile.hash !== undefined)
    assert(validatedFile.hash.length === 64)  // SHA-256 = 64 hex chars
  })
})
```

---

## 6. Row-Level Security

### Overview
Ensure users can only access their own data at the database level.

### Why It's Needed
- Defense-in-depth (even if app logic fails, DB enforces access)
- Compliance requirement
- Prevents data leakage

### Implementation

#### Step 1: Enable RLS in PostgreSQL

**Location:** `apps/payment-api/src/migrations/001-enable-rls.sql`

```sql
-- PSEUDO CODE

-- Enable RLS on wallets table
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own wallets
CREATE POLICY wallet_user_isolation ON wallets
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy: users can see transactions they're involved in
CREATE POLICY transaction_user_isolation ON transactions
  FOR ALL
  USING (
    user_id = current_setting('app.current_user_id')::uuid
    OR sender_id = current_setting('app.current_user_id')::uuid
    OR recipient_id = current_setting('app.current_user_id')::uuid
  );

-- Enable RLS on payment_methods table
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own payment methods
CREATE POLICY payment_method_user_isolation ON payment_methods
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Admin bypass policy (for admin users)
CREATE POLICY admin_bypass ON wallets
  FOR ALL
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY admin_bypass ON transactions
  FOR ALL
  USING (current_setting('app.user_role', true) = 'admin');
```

#### Step 2: Set User Context Before Queries

**Location:** `apps/payment-api/src/common/interceptors/rls-context.interceptor.ts`

```typescript
// PSEUDO CODE

class RLSContextInterceptor {

  async function intercept(context, next) {
    request = context.switchToHttp().getRequest()
    user = request.user

    if (user) {
      // Set user context in PostgreSQL session
      dataSource = getDataSource()
      queryRunner = dataSource.createQueryRunner()

      await queryRunner.connect()

      try {
        // Set current user ID
        await queryRunner.query(
          `SET LOCAL app.current_user_id = $1`,
          [user.id]
        )

        // Set user role
        await queryRunner.query(
          `SET LOCAL app.user_role = $1`,
          [user.role]
        )

        // Store query runner in request for later use
        request.queryRunner = queryRunner

        // Execute handler
        result = await next.handle().toPromise()

        return result
      } finally {
        // Reset context
        await queryRunner.query(`RESET app.current_user_id`)
        await queryRunner.query(`RESET app.user_role`)
        await queryRunner.release()
      }
    }

    return next.handle()
  }
}
```

#### Step 3: Apply Globally

**Location:** `apps/payment-api/src/app.module.ts`

```typescript
// PSEUDO CODE

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RLSContextInterceptor
    }
  ]
})
class AppModule {}
```

#### Step 4: Testing

```typescript
// PSEUDO CODE

describe('Row-Level Security', () => {
  test('user can only see own wallets', async () => {
    user1 = createUser('user-1')
    user2 = createUser('user-2')

    wallet1 = createWallet(user1.id, 'NGN')
    wallet2 = createWallet(user2.id, 'NGN')

    // Set context to user1
    await setUserContext(user1.id)

    wallets = await walletRepository.find()

    // Should only see user1's wallet
    assert(wallets.length === 1)
    assert(wallets[0].id === wallet1.id)
  })

  test('user cannot access other users transactions', async () => {
    user1 = createUser('user-1')
    user2 = createUser('user-2')

    tx1 = createTransaction(user1.id)
    tx2 = createTransaction(user2.id)

    // Set context to user1
    await setUserContext(user1.id)

    // Try to get user2's transaction
    transaction = await transactionRepository.findOne({
      where: {id: tx2.id}
    })

    // Should be null (RLS blocked it)
    assert(transaction === null)
  })

  test('admin can see all records', async () => {
    user1 = createUser('user-1')
    user2 = createUser('user-2')
    admin = createUser('admin', role: 'admin')

    wallet1 = createWallet(user1.id, 'NGN')
    wallet2 = createWallet(user2.id, 'NGN')

    // Set context to admin
    await setUserContext(admin.id, role: 'admin')

    wallets = await walletRepository.find()

    // Admin should see all wallets
    assert(wallets.length === 2)
  })
})
```

---

*[Document continues with remaining 11 features...]*

---

## Implementation Checklist

### Priority 1 (Critical - Implement First)
- [ ] Field-level encryption
- [ ] Database SSL/TLS
- [ ] Redis password authentication
- [ ] File upload validation
- [ ] Webhook signature verification
- [ ] Transaction signing

### Priority 2 (High - Implement Second)
- [ ] Row-level security
- [ ] Query protection
- [ ] MinIO bucket policies
- [ ] Docker hardening
- [ ] Health checks

### Priority 3 (Medium - Implement Third)
- [ ] Memory/resource limits
- [ ] Network isolation
- [ ] Graceful shutdown
- [ ] Geo-blocking
- [ ] WAF rules

### Priority 4 (Nice to Have)
- [ ] Secrets rotation
- [ ] Advanced monitoring

---

## Testing Strategy

```typescript
// PSEUDO CODE

// Security test suite
describe('Security Features', () => {

  // Encryption tests
  describe('Encryption', () => {
    test('field encryption works')
    test('database SSL enabled')
    test('redis TLS enabled')
    test('file encryption at rest')
  })

  // Access control tests
  describe('Access Control', () => {
    test('RLS prevents unauthorized access')
    test('signed URLs expire')
    test('webhook signatures verified')
  })

  // Input validation tests
  describe('Input Validation', () => {
    test('malicious files rejected')
    test('SQL injection blocked')
    test('XSS attempts blocked')
    test('oversized requests rejected')
  })

  // Resource protection tests
  describe('Resource Protection', () => {
    test('query timeout enforced')
    test('connection pool limits work')
    test('memory limits enforced')
  })
})
```

---

## Monitoring Security

```typescript
// PSEUDO CODE

// Log all security events
class SecurityLogger {

  async function logSecurityEvent(eventType, details) {
    event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      severity: getSeverity(eventType),
      details: details,

      // Context
      userId: details.userId,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,

      // Correlation
      requestId: details.requestId,
      sessionId: details.sessionId
    }

    // Log to multiple destinations
    await Promise.all([
      logger.error(event),              // Application logs
      auditLog.write(event),            // Audit trail
      securityMonitor.alert(event),     // Real-time monitoring
      metrics.increment(eventType)      // Metrics
    ])

    // Auto-respond to critical events
    if (event.severity === 'critical') {
      await autoRespond(event)
    }
  }

  async function autoRespond(event) {
    switch(event.type) {
      case 'MULTIPLE_FAILED_LOGINS':
        await lockAccount(event.userId)
        break

      case 'MALICIOUS_FILE_UPLOAD':
        await blacklistIP(event.ipAddress, '24h')
        break

      case 'SQL_INJECTION_ATTEMPT':
        await blacklistIP(event.ipAddress, 'permanent')
        await alertSecurityTeam(event)
        break
    }
  }
}
```

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Redis Security](https://redis.io/docs/management/security/)

---

**Next Steps:**
1. Implement features in order of priority
2. Write tests for each feature
3. Document each implementation
4. Security audit after implementation
5. Penetration testing (manual)

