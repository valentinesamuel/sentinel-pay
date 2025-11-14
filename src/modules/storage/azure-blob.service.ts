import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  BlockBlobUploadResponse,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { nanoid } from 'nanoid';

export interface UploadResult {
  url: string;
  blobName: string;
  containerName: string;
  contentType: string;
  size: number;
}

@Injectable()
export class AzureBlobService {
  private readonly logger = new Logger(AzureBlobService.name);
  private blobServiceClient: BlobServiceClient;
  private defaultContainerName: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor(private configService: ConfigService) {
    const useConnectionString = this.configService.get<boolean>(
      'azureStorage.useConnectionString',
    );
    const accountName = this.configService.get<string>(
      'azureStorage.accountName',
    );

    if (useConnectionString) {
      // Option 1: Connection String (requires IP whitelisting or trusted services)
      const connectionString = this.configService.get<string>(
        'azureStorage.connectionString',
      );
      if (!connectionString) {
        throw new Error(
          'AZURE_STORAGE_CONNECTION_STRING is required when AZURE_USE_CONNECTION_STRING is true',
        );
      }
      this.logger.log('Initializing Azure Blob Service with Connection String');
      this.blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
    } else {
      // Option 2: Managed Identity (works with VNet/Private Endpoints)
      if (!accountName) {
        throw new Error(
          'AZURE_STORAGE_ACCOUNT_NAME is required when using Managed Identity',
        );
      }
      this.logger.log('Initializing Azure Blob Service with Managed Identity');
      this.blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential(),
      );
    }

    this.defaultContainerName = this.configService.get<string>(
      'azureStorage.containerName',
      'uploads',
    );
    this.maxFileSize = this.configService.get<number>(
      'azureStorage.maxFileSize',
      10 * 1024 * 1024,
    );
    this.allowedMimeTypes = this.configService.get<string[]>(
      'azureStorage.allowedMimeTypes',
      [],
    );

    this.logger.log(
      `Azure Blob Service initialized. Default container: ${this.defaultContainerName}`,
    );
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    buffer: Buffer,
    mimetype: string,
    originalName: string,
  ): void {
    // Check file size
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Check MIME type if restrictions are configured
    if (
      this.allowedMimeTypes.length > 0 &&
      !this.allowedMimeTypes.includes(mimetype)
    ) {
      throw new BadRequestException(
        `File type ${mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    this.logger.debug(
      `File validation passed: ${originalName} (${buffer.length} bytes, ${mimetype})`,
    );
  }

  /**
   * Generate a unique blob name with original file extension
   */
  private generateBlobName(originalName: string, prefix?: string): string {
    const extension = originalName.split('.').pop();
    const uniqueId = nanoid(16);
    const timestamp = Date.now();
    const blobName = prefix
      ? `${prefix}/${timestamp}-${uniqueId}.${extension}`
      : `${timestamp}-${uniqueId}.${extension}`;

    return blobName;
  }

  /**
   * Get or create container client
   */
  private async getContainerClient(
    containerName?: string,
  ): Promise<ContainerClient> {
    const container = containerName || this.defaultContainerName;
    const containerClient =
      this.blobServiceClient.getContainerClient(container);

    try {
      // Create container if it doesn't exist (with private access)
      const exists = await containerClient.exists();
      if (!exists) {
        await containerClient.create({
          access: 'blob', // 'blob' = anonymous read access to blobs, 'container' = public, 'private' = no anonymous access
        });
        this.logger.log(`Created container: ${container}`);
      }
    } catch (error) {
      if (error.statusCode !== 409) {
        // 409 means container already exists
        this.logger.error(
          `Error creating/accessing container: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          'Failed to access storage container',
        );
      }
    }

    return containerClient;
  }

  /**
   * Upload a file to Azure Blob Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options?: {
      containerName?: string;
      prefix?: string;
      customBlobName?: string;
    },
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file.buffer, file.mimetype, file.originalname);

      // Get container client
      const containerClient = await this.getContainerClient(
        options?.containerName,
      );

      // Generate blob name
      const blobName =
        options?.customBlobName ||
        this.generateBlobName(file.originalname, options?.prefix);

      // Get block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload file
      const uploadResponse: BlockBlobUploadResponse =
        await blockBlobClient.upload(file.buffer, file.buffer.length, {
          blobHTTPHeaders: {
            blobContentType: file.mimetype,
            blobContentDisposition: `inline; filename="${file.originalname}"`,
          },
          metadata: {
            originalName: file.originalname,
            uploadedAt: new Date().toISOString(),
          },
        });

      this.logger.log(
        `Successfully uploaded blob: ${blobName} (Request ID: ${uploadResponse.requestId})`,
      );

      return {
        url: blockBlobClient.url,
        blobName,
        containerName: containerClient.containerName,
        contentType: file.mimetype,
        size: file.buffer.length,
      };
    } catch (error) {
      this.logger.error(
        `Error uploading file: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Upload multiple files to Azure Blob Storage
   */
  async uploadFiles(
    files: Express.Multer.File[],
    options?: {
      containerName?: string;
      prefix?: string;
    },
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, options),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a blob from Azure Blob Storage
   */
  async deleteBlob(
    blobName: string,
    containerName?: string,
  ): Promise<boolean> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const deleteResponse = await blockBlobClient.delete();
      this.logger.log(
        `Successfully deleted blob: ${blobName} (Request ID: ${deleteResponse.requestId})`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting blob ${blobName}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Check if a blob exists
   */
  async blobExists(blobName: string, containerName?: string): Promise<boolean> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return await blockBlobClient.exists();
    } catch (error) {
      this.logger.error(
        `Error checking blob existence: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Get blob URL (works with private storage when accessed through private endpoint)
   */
  getBlobUrl(blobName: string, containerName?: string): string {
    const container = containerName || this.defaultContainerName;
    const containerClient = this.blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }

  /**
   * List blobs in a container with optional prefix filter
   */
  async listBlobs(
    containerName?: string,
    prefix?: string,
  ): Promise<string[]> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blobNames: string[] = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        blobNames.push(blob.name);
      }

      return blobNames;
    } catch (error) {
      this.logger.error(
        `Error listing blobs: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to list files');
    }
  }
}
