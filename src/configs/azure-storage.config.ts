import { registerAs } from '@nestjs/config';

export default registerAs('azureStorage', () => ({
  accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads',
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  useConnectionString: process.env.AZURE_USE_CONNECTION_STRING === 'true',
  // Maximum file size in bytes (default: 10MB)
  maxFileSize: process.env.MAX_FILE_SIZE
    ? Number.parseInt(process.env.MAX_FILE_SIZE)
    : 10 * 1024 * 1024,
  // Allowed MIME types for uploads
  allowedMimeTypes: process.env.ALLOWED_MIME_TYPES
    ? process.env.ALLOWED_MIME_TYPES.split(',')
    : [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
}));
