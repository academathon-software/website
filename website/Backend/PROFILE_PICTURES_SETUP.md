# Profile Pictures with AWS S3 - Setup Guide

## Overview
This application now supports profile picture uploads using AWS S3 for storage. Users can upload, view, and delete their profile pictures.

## AWS S3 Setup

### 1. Create an S3 Bucket
1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Bucket name: `academathon-profile-pictures` (or your preferred name)
5. Region: `us-east-1` (or your preferred region)
6. Uncheck "Block all public access" (we need public read access for profile pictures)
7. Acknowledge the warning and create the bucket

### 2. Configure Bucket Policy
Add the following bucket policy to allow public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::academathon-profile-pictures/*"
        }
    ]
}
```

### 3. Create IAM User
1. Navigate to IAM service in AWS Console
2. Click "Users" → "Create user"
3. User name: `academathon-s3-user`
4. Attach the policy: `AmazonS3FullAccess` (or create a custom policy for more security)
5. Create access keys for programmatic access
6. Save the Access Key ID and Secret Access Key

### 4. Configure Environment Variables

Add the following environment variables to your system or `.env` file:

```properties
AWS_S3_BUCKET_NAME=academathon-profile-pictures
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

**Important:** Never commit your AWS credentials to version control!

## API Endpoints

### Upload Profile Picture
**POST** `/users/profile-picture`
- **Authentication:** Required (Bearer token)
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `file`: Image file (JPEG, PNG, GIF, etc.)
  - Max size: 5MB
- **Response:**
  ```json
  {
    "message": "Profile picture uploaded successfully",
    "profilePictureUrl": "https://bucket-name.s3.amazonaws.com/profile-pictures/123-uuid.jpg"
  }
  ```

### Get Profile Picture URL
**GET** `/users/profile-picture`
- **Authentication:** Required (Bearer token)
- **Response:**
  ```json
  {
    "profilePictureUrl": "https://bucket-name.s3.amazonaws.com/profile-pictures/123-uuid.jpg"
  }
  ```

### Delete Profile Picture
**DELETE** `/users/profile-picture`
- **Authentication:** Required (Bearer token)
- **Response:**
  ```json
  {
    "message": "Profile picture deleted successfully"
  }
  ```

### Get Current User (includes profile picture)
**GET** `/users/me`
- **Authentication:** Required (Bearer token)
- **Response:** User object with `profilePictureUrl` field

## Database Migration

A new migration file has been created: `V3__add_profile_picture_url.sql`

To apply the migration:
```bash
mvn flyway:migrate
```

Or it will be applied automatically when you start the Spring Boot application.

## Frontend Integration Example

### Upload Profile Picture
```javascript
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8080/users/profile-picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};
```

### Display Profile Picture
```javascript
const getProfilePicture = async () => {
  const response = await fetch('http://localhost:8080/users/profile-picture', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.profilePictureUrl;
};
```

### Delete Profile Picture
```javascript
const deleteProfilePicture = async () => {
  const response = await fetch('http://localhost:8080/users/profile-picture', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## Features

✅ Secure file upload to AWS S3
✅ Automatic deletion of old profile pictures when uploading new ones
✅ Image validation (only image files allowed)
✅ File size limit (5MB)
✅ Unique file naming to prevent conflicts
✅ Public read access for easy display
✅ Authenticated endpoints (users can only manage their own pictures)

## Security Considerations

1. **File Validation**: Only image files are allowed
2. **Size Limit**: Maximum 5MB per file
3. **Authentication**: All endpoints require valid JWT token
4. **User Isolation**: Users can only manage their own profile pictures
5. **AWS Credentials**: Store credentials in environment variables, never in code

## Troubleshooting

### "Failed to upload file to S3"
- Check AWS credentials are correct
- Verify bucket name and region match configuration
- Ensure IAM user has S3 permissions
- Check bucket policy allows uploads

### "File must be an image"
- Only image files (JPEG, PNG, GIF, etc.) are allowed
- Check the file's MIME type

### "File is empty"
- Ensure the file is properly attached to the request
- Check the form data key is "file"

## Next Steps

Consider implementing:
- Image resizing/optimization before upload
- Support for different image sizes (thumbnail, medium, full)
- CDN integration for faster image delivery
- Image cropping functionality in the frontend
- Progress indicators for uploads


