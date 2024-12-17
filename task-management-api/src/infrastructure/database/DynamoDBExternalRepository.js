import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDb } from './DynamoDBConfig.js';

const tableName = process.env.DYNAMO_USER_TABLE_NAME || 'UserCache';

export class DynamoDBExternalRepository {
  // Get data from DynamoDB cache
  getFromCache = async (key) => {
    try {
      const command = new GetItemCommand({
        TableName: tableName,
        Key: {
          "cacheKey": { S: key },
        },
      });

      const result = await dynamoDb.send(command);
      return result.Item ? result.Item : [];
    } catch (error) {
      console.error("Error fetching from cache:", error);
      throw error;
    }
  };

  // Put data into DynamoDB cache
  putInCache = async (key, data) => {
    try {
      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          "cacheKey": { S: key },
          "data": { S: JSON.stringify(data) },
        },
      });

      await dynamoDb.send(command);
      console.log(`Data successfully cached with key: ${key}`);
    } catch (error) {
      console.error("Error putting data into cache:", error);
      throw error;
    }
  };
}
