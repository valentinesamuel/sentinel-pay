import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: Express.Multer.File;

  @ApiProperty({
    description: 'Optional prefix/folder path for organizing files',
    example: 'invoices',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prefix?: string;

  @ApiProperty({
    description: 'Optional custom blob name (including extension)',
    example: 'my-custom-name.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customBlobName?: string;
}

export class UploadMultipleFilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Files to upload',
  })
  files: Express.Multer.File[];

  @ApiProperty({
    description: 'Optional prefix/folder path for organizing files',
    example: 'documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  prefix?: string;
}

export class DeleteFileDto {
  @ApiProperty({
    description: 'Name of the blob to delete',
    example: 'invoices/1234567890-abc123def456.pdf',
  })
  @IsString()
  blobName: string;

  @ApiProperty({
    description: 'Container name (optional, uses default if not provided)',
    required: false,
  })
  @IsOptional()
  @IsString()
  containerName?: string;
}
