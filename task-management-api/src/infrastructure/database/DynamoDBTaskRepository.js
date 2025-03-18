/* eslint-disable no-undef */
import { dynamoDb } from './DynamoDBConfig.js';
import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';


const tableName = process.env.DYNAMO_TASK_TABLE_NAME || 'Tasks';

export class DynamoDBTaskRepository {
  async create(task) {
    try {
      const command = new PutCommand({
        TableName: tableName,
        Item: task,
      });
      return await dynamoDb.send(command);
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const command = new GetCommand({
        TableName: tableName,
        Key: { id },
      });
      const result = await dynamoDb.send(command);
      return result.Item || null;
    } catch (error) {
      console.error('Error finding task by ID:', error);
      throw new Error(`Failed to find task: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const command = new ScanCommand({
        TableName: tableName,
      });
      const result = await dynamoDb.send(command);
      return result.Items || [];
    } catch (error) {
      console.error('Error finding all tasks:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
  }

  async update(task) {
    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: { id: task.id },
        UpdateExpression: 'SET #title = :title, #description = :description, #status = :status, #updatedAt = :newUpdatedAt',
        ConditionExpression: '#updatedAt = :currentUpdatedAt',
        ExpressionAttributeNames: {
          '#title': 'title',
          '#description': 'description',
          '#status': 'status',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':title': task.title,
          ':description': task.description,
          ':status': task.status,
          ':currentUpdatedAt': task.updatedAt,
          ':newUpdatedAt': new Date().toISOString()
        },
      });
      return await dynamoDb.send(command);
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.error('Concurrent update detected for task:', task.id);
        throw new Error(`Concurrent modification detected for task ${task.id}. Please retry with latest version.`);
      }
      console.error('Error updating task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: { id },
      });
      await dynamoDb.send(command);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }
}

export default DynamoDBTaskRepository;
