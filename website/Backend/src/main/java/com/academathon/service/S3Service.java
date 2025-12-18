package com.academathon.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;
    private final String bucketName;
    private final String region;

    public S3Service(
            @Value("${aws.s3.bucket-name}") String bucketName,
            @Value("${aws.s3.region}") String region,
            @Value("${aws.s3.access-key}") String accessKey,
            @Value("${aws.s3.secret-key}") String secretKey) {
        
        this.bucketName = bucketName;
        this.region = region;
        
        try {
            // Initialize S3 client
            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
            this.s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();
            
            // Test connection by checking if bucket exists
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            s3Client.headBucket(headBucketRequest);
        } catch (S3Exception e) {
            System.err.println("✗ S3 Connection Error: " + e.awsErrorDetails().errorMessage());
            System.err.println("Error Code: " + e.awsErrorDetails().errorCode());
            throw new RuntimeException("Failed to connect to S3: " + e.getMessage(), e);
        }
    }

    /**
     * Upload a profile picture to S3
     * @param file The multipart file to upload
     * @param userId The user ID (used to create a unique filename)
     * @return The URL of the uploaded file
     */
    public String uploadProfilePicture(MultipartFile file, Long userId) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type (only allow images)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".jpg";
        String fileName = "profile-pictures/" + userId + "-" + UUID.randomUUID() + fileExtension;

        try {
            // Upload file to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    // Note: ACL removed - bucket must be configured for public access via bucket policy
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Return the public URL
            return getFileUrl(fileName);
        } catch (S3Exception e) {
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a profile picture from S3
     * @param fileUrl The URL of the file to delete
     */
    public void deleteProfilePicture(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            // Extract the key from the URL
            String fileName = extractKeyFromUrl(fileUrl);
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        }
    }

    /**
     * Get the public URL for a file
     * @param fileName The file key in S3
     * @return The public URL
     */
    private String getFileUrl(String fileName) {
        // For ca-central-1 and other non-us-east-1 regions, include region in URL
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    /**
     * Extract the S3 key from a full URL
     * @param fileUrl The full S3 URL
     * @return The file key
     */
    private String extractKeyFromUrl(String fileUrl) {
        // Example URL: https://bucket-name.s3.ca-central-1.amazonaws.com/profile-pictures/123-uuid.jpg
        // Extract: profile-pictures/123-uuid.jpg
        if (fileUrl.contains(".amazonaws.com/")) {
            return fileUrl.substring(fileUrl.indexOf(".amazonaws.com/") + 15);
        }
        // If it's already just the key, return it
        return fileUrl;
    }
}


