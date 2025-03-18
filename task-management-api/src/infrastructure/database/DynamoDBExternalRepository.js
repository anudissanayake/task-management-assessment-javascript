import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from './DynamoDBConfig.js';

const tableName = process.env.DYNAMO_USER_TABLE_NAME || 'UserCache';
const CACHE_TTL_MINUTES = 5;
export class DynamoDBExternalRepository {
  // Get data from DynamoDB cache
  getFromCache = async (key) => {
    try {
      const command = new GetItemCommand({
        TableName: tableName,
        Key: {
          "cacheKey": { S: key }
        }
      });

      const result = await dynamoDb.send(command);

      if (!result.Item) {
        return [];
      }

      // Check if cache has expired
      const ttl = Number(result.Item.ttl.N);
      if (ttl < Math.floor(Date.now() / 1000)) {
        return []; // Cache expired
      }

      return JSON.parse(result.Item.data.S);
    } catch (error) {
      console.error("Error fetching from cache:", error);
      throw error;
    }
  };

  // Put data into DynamoDB cache
  putInCache = async (key, data) => {
    try {
      const ttl = Math.floor(Date.now() / 1000) + (CACHE_TTL_MINUTES * 60);

      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          "cacheKey": { S: key },
          "data": { S: JSON.stringify(data) },
          "ttl": { N: ttl.toString() }
        }
      });

      await dynamoDb.send(command);
      console.log(`Data successfully cached with key: ${key}`);
    } catch (error) {
      console.error("Error putting data into cache:", error);
      throw error;
    }
  };
}
