# Azure Blob Storage Module

This module provides file upload functionality to Azure Blob Storage, designed to work with **private blob storage** accessed through **private endpoints** and served via **Azure Front Door**.

## Architecture Overview

```
Frontend (via Front Door) → NestJS API → Azure Blob Storage (Private Endpoint)
                             ↓
                        VNet Integration
```

### How It Works

1. **Frontend uploads files** through Azure Front Door to your NestJS API endpoint
2. **NestJS API** (running in Azure with VNet integration) processes the upload
3. **Backend connects** to Azure Blob Storage via **private endpoint** (within VNet)
4. **Files are stored** in private blob storage
5. **Files are read** through Front Door (configured to access private storage)

## Prerequisites

### Azure Infrastructure Setup

#### 1. Azure Blob Storage Account
- Create a Storage Account in Azure Portal
- Configure **Private Endpoint** in your VNet
- Network settings:
  - Public network access: **Disabled** (or "Enabled from selected virtual networks")
  - Add your VNet/Subnet to allowed networks

#### 2. Azure App Service / Container Instance
Your NestJS backend must run in Azure with:
- **VNet Integration** enabled
- Connected to the same VNet as your Storage Account private endpoint
- **Managed Identity** enabled (System-assigned or User-assigned)

#### 3. Grant Storage Permissions
- Go to Storage Account → **Access Control (IAM)**
- Add role assignment: **Storage Blob Data Contributor**
- Assign to your App Service's Managed Identity

#### 4. Azure Front Door Configuration
- Configure Front Door to route requests to your NestJS backend
- Set up origin to point to your App Service
- Configure CORS if needed
- For serving blobs: Add blob storage as an additional origin (optional)

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Option 1: Using Managed Identity (Recommended for private endpoints)
AZURE_USE_CONNECTION_STRING=false
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount

# Option 2: Using Connection String (requires IP whitelisting)
AZURE_USE_CONNECTION_STRING=true
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Common settings
AZURE_STORAGE_CONTAINER_NAME=uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf
```

### Recommended Setup for Private Endpoints

```bash
AZURE_USE_CONNECTION_STRING=false
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount
AZURE_STORAGE_CONTAINER_NAME=uploads
MAX_FILE_SIZE=10485760
```

## API Endpoints

### Upload Single File
```http
POST /storage/upload
Content-Type: multipart/form-data

file: [binary]
prefix: "invoices" (optional)
customBlobName: "custom-name.pdf" (optional)
```

**Response:**
```json
{
  "url": "https://yourstorageaccount.blob.core.windows.net/uploads/1234567890-abc123.pdf",
  "blobName": "1234567890-abc123.pdf",
  "containerName": "uploads",
  "contentType": "application/pdf",
  "size": 102400
}
```

### Upload Multiple Files
```http
POST /storage/upload-multiple
Content-Type: multipart/form-data

files: [binary array]
prefix: "documents" (optional)
```

### Delete File
```http
DELETE /storage/delete
Content-Type: application/json

{
  "blobName": "1234567890-abc123.pdf",
  "containerName": "uploads"
}
```

### List Files
```http
GET /storage/list?prefix=invoices&containerName=uploads
```

### Get Blob URL
```http
GET /storage/url?blobName=1234567890-abc123.pdf&containerName=uploads
```

## Frontend Integration

### Example: Upload from React

```typescript
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prefix', 'user-uploads');

  const response = await fetch('https://your-frontdoor.azurefd.net/storage/upload', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  console.log('Uploaded:', result.url);
}
```

### Example: Multiple Files

```typescript
async function uploadMultipleFiles(files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('prefix', 'batch-uploads');

  const response = await fetch('https://your-frontdoor.azurefd.net/storage/upload-multiple', {
    method: 'POST',
    body: formData,
  });

  const results = await response.json();
  return results;
}
```

## Backend Usage (Within Other Modules)

```typescript
import { AzureBlobService } from '@modules/storage/azure-blob.service';

@Injectable()
export class MyService {
  constructor(private azureBlobService: AzureBlobService) {}

  async processUpload(file: Express.Multer.File) {
    const result = await this.azureBlobService.uploadFile(file, {
      prefix: 'processed-documents',
    });

    return result.url;
  }
}
```

## Troubleshooting

### Issue: "This request is not authorized to perform this operation"

**Solutions:**
1. Ensure Managed Identity is enabled on your App Service
2. Verify IAM role assignment (Storage Blob Data Contributor)
3. Check VNet integration is configured correctly
4. Confirm private endpoint DNS resolution

### Issue: "Cannot access private storage from local development"

**Solutions:**
1. Use connection string during development with IP whitelisting:
   ```bash
   AZURE_USE_CONNECTION_STRING=true
   AZURE_STORAGE_CONNECTION_STRING=your_connection_string
   ```
2. Add your development machine's IP to Storage Account firewall
3. Use Azure VPN for secure access to VNet

### Issue: "CORS errors when uploading through Front Door"

**Solutions:**
1. Configure CORS in Storage Account (if accessing blobs directly)
2. Ensure your NestJS CORS settings allow Front Door origin
3. Check Front Door routing rules

## Security Best Practices

1. **Always use Managed Identity in production** (avoid connection strings)
2. **Enable private endpoints** and disable public access
3. **Use VNet integration** for your compute resources
4. **Set appropriate CORS policies**
5. **Validate file types and sizes** before upload (already implemented)
6. **Use container-level access policies** (not account-level)
7. **Enable Azure Storage logging** and monitoring
8. **Rotate connection strings regularly** (if used)

## File Validation

The service automatically validates:
- **File size**: Maximum defined by `MAX_FILE_SIZE` (default 10MB)
- **MIME types**: Only allowed types defined in `ALLOWED_MIME_TYPES`
- Generates unique blob names to prevent conflicts

## Container Access Levels

The service creates containers with `blob` access level:
- `blob`: Anonymous read access to individual blobs (not container listing)
- `container`: Full public read access (not recommended)
- `private`: No anonymous access (requires authentication)

For private storage, you can change this in `azure-blob.service.ts:156`.

## Performance Considerations

1. **Large files**: Consider implementing chunked uploads for files >100MB
2. **Concurrent uploads**: The service supports parallel uploads
3. **CDN**: Use Front Door CDN capabilities for serving static files
4. **Caching**: Implement caching strategies for frequently accessed files

## Monitoring

Monitor your blob storage through:
- Azure Portal → Storage Account → Monitoring
- Azure Monitor / Application Insights
- Check NestJS logs for upload operations
- Enable Storage Analytics

## Additional Resources

- [Azure Private Endpoints Documentation](https://docs.microsoft.com/azure/private-link/private-endpoint-overview)
- [Azure Managed Identity Documentation](https://docs.microsoft.com/azure/active-identity/managed-identities)
- [Azure Blob Storage SDK for Node.js](https://docs.microsoft.com/azure/storage/blobs/storage-quickstart-blobs-nodejs)
- [Azure Front Door Documentation](https://docs.microsoft.com/azure/frontdoor/)
