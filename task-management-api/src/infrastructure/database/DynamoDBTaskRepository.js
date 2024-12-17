/* eslint-disable no-undef */
import { dynamoDb } from './DynamoDBConfig.js';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';


const tableName = process.env.DYNAMO_TASK_TABLE_NAME || 'Tasks';

export class DynamoDBTaskRepository {
  async create(task) {
    const command = new PutCommand({
      TableName: tableName,
      Item: task,
    });
    return await dynamoDb.send(command);
  }

  async findById(id) {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    });
    const result = await dynamoDb.send(command);
    return result.Item || null;
  }

  async findAll() {
    const command = new ScanCommand({
      TableName: tableName,
    });
    const result = await dynamoDb.send(command);
    return result.Items || [];
  }

  async update(task) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { id: task.id },
      UpdateExpression: 'SET #title = :title, #description = :description, #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#description': 'description',
        '#status': 'status',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':title': task.title,
        ':description': task.description,
        ':status': task.status,
        ':updatedAt': task.updatedAt,
      },
    });
    return await dynamoDb.send(command);
  }

  async delete(id) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { id },
    });
    await dynamoDb.send(command);
  }
}

export default DynamoDBTaskRepository;
