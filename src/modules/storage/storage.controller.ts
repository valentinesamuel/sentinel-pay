import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AzureBlobService, UploadResult } from './azure-blob.service';
import {
  UploadFileDto,
  UploadMultipleFilesDto,
  DeleteFileDto,
} from './dto/upload-file.dto';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly azureBlobService: AzureBlobService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a single file to Azure Blob Storage',
    description:
      'Upload a file through the backend API which connects to private Azure Blob Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        prefix: {
          type: 'string',
          description: 'Optional folder/prefix for the file',
        },
        customBlobName: {
          type: 'string',
          description: 'Optional custom blob name',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        blobName: { type: 'string' },
        containerName: { type: 'string' },
        contentType: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or parameters',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.azureBlobService.uploadFile(file, {
      prefix: uploadFileDto.prefix,
      customBlobName: uploadFileDto.customBlobName,
    });
  }

  @Post('upload-multiple')
  @ApiOperation({
    summary: 'Upload multiple files to Azure Blob Storage',
    description: 'Upload multiple files in a single request',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        prefix: {
          type: 'string',
          description: 'Optional folder/prefix for the files',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          blobName: { type: 'string' },
          containerName: { type: 'string' },
          contentType: { type: 'string' },
          size: { type: 'number' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadMultipleFilesDto: UploadMultipleFilesDto,
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    return this.azureBlobService.uploadFiles(files, {
      prefix: uploadMultipleFilesDto.prefix,
    });
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'Delete a blob from Azure Blob Storage',
    description: 'Delete a file by its blob name',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async deleteFile(
    @Body() deleteFileDto: DeleteFileDto,
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.azureBlobService.deleteBlob(
      deleteFileDto.blobName,
      deleteFileDto.containerName,
    );

    return {
      success,
      message: success ? 'File deleted successfully' : 'Failed to delete file',
    };
  }

  @Get('list')
  @ApiOperation({
    summary: 'List all blobs in a container',
    description: 'Get a list of all blob names, optionally filtered by prefix',
  })
  @ApiResponse({
    status: 200,
    description: 'List of blob names',
    schema: {
      type: 'object',
      properties: {
        blobs: {
          type: 'array',
          items: { type: 'string' },
        },
        count: { type: 'number' },
      },
    },
  })
  async listBlobs(
    @Query('prefix') prefix?: string,
    @Query('containerName') containerName?: string,
  ): Promise<{ blobs: string[]; count: number }> {
    const blobs = await this.azureBlobService.listBlobs(containerName, prefix);

    return {
      blobs,
      count: blobs.length,
    };
  }

  @Get('url')
  @ApiOperation({
    summary: 'Get blob URL',
    description: 'Get the full URL for a blob',
  })
  @ApiResponse({
    status: 200,
    description: 'Blob URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async getBlobUrl(
    @Query('blobName') blobName: string,
    @Query('containerName') containerName?: string,
  ): Promise<{ url: string }> {
    if (!blobName) {
      throw new BadRequestException('blobName query parameter is required');
    }

    const url = this.azureBlobService.getBlobUrl(blobName, containerName);

    return { url };
  }
}
