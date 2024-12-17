/* eslint-disable no-undef */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';
dotenv.config();

class DynamoDbSingleton {
  constructor() {
    // Private constructor logic is enforced via closure pattern
    throw new Error("Use DynamoDbSingleton.getInstance()");
  }

  static getInstance() {
    if (!DynamoDbSingleton.instance) {
      const dynamoDbClient = new DynamoDBClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      DynamoDbSingleton.instance = DynamoDBDocumentClient.from(dynamoDbClient);
    }

    return DynamoDbSingleton.instance;
  }
}

// Export the Singleton instance
export const dynamoDb = DynamoDbSingleton.getInstance();
