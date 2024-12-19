/* eslint-disable no-undef */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.S3_BUCKET_NAME;

// Create an S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// File upload service class
export class FileUploadService {
  /**
   * Uploads a file to the storage provider.
   * @param {Buffer} file - The file content as a buffer.
   * @param {string} fileName - The name of the file to be stored.
   * @param {string} mimeType - The MIME type of the file.
   * @returns {Promise<string>} A promise resolving to the public URL of the uploaded file.
   */
  async uploadFile(file, fileName, mimeType) {
    try {
      const params = {
        Bucket: bucketName,
        Key: `${Date.now()}-${fileName}`,
        Body: file,
        ContentType: mimeType,
      };
      // Upload the file to S3
      await s3Client.send(new PutObjectCommand(params));
      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (error) {
      error.message = `File upload failed: ${error.message}`;
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Deletes a file from the storage provider.
   * @param {string} fileKey - The key of the file to delete.
   */
  async deleteFile(fileKey) {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(params));
      console.log(`File with key ${fileKey} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting file with key ${fileKey}:`, error);
      error.message = `Error deleting file with key ${fileKey}:`;
      error.statusCode = 500;
      throw error;
    }
  }
}
