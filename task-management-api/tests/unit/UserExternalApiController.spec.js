/* eslint-disable no-undef */
import { jest } from '@jest/globals';

import { UserExternalApiController } from '../../src/controllers/UserExternalApiController.js'
import { UserExternalApiService } from '../../src/services/UserExternalApiService.js';
import { DynamoDBExternalRepository } from '../../src/infrastructure/database/DynamoDBExternalRepository.js';
import { dynamoDb } from '../../src/infrastructure/database/DynamoDBConfig.js';

// Mock dependencies
jest.mock('axios');
jest.mock('../../src/infrastructure/database/DynamoDBConfig.js');
const tableName = 'UserCache';
const mockKey = 'test-key';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error logs
});


afterEach(() => {
  jest.restoreAllMocks();
});

describe('UserExternalApiController', () => {
  let req;
  let res;
  let next;
  let userService;
  let userController;

  const mockUsers = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      address: {
        street: 'Kulas Light',
        suite: 'Apt. 556',
        city: 'Gwenborough',
        zipcode: '92998-3874',
        geo: { lat: '-37.3159', lng: '81.1496' },
      },
      phone: '1-770-736-8031 x56442',
      website: 'hildegard.org',
      company: {
        name: 'Romaguera-Crona',
        catchPhrase: 'Multi-layered client-server neural-net',
        bs: 'harness real-time e-markets',
      },
    },
  ];

  beforeEach(() => {
    userService = new UserExternalApiService(new DynamoDBExternalRepository());

    userService.fetchUsers = jest.fn(); // Mock the service method
    userController = new UserExternalApiController(userService);
    req = {}; // Mocked request object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }; // Mocked response object
    next = jest.fn(); // Mocked next function
  });

  afterEach(() => jest.clearAllMocks());

  describe('fetchUsers', () => {
    it('should return users from cache if present', async () => {
      userService.fetchUsers.mockResolvedValue(mockUsers);

      // Call the controller method with req, res, and next
      await userController.getUsers(req, res, next);

      // Assertions
      expect(userService.fetchUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUsers});
      expect(next).not.toHaveBeenCalled();
    });
  });
});

describe('DynamoDBExternalRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new DynamoDBExternalRepository();
    jest.clearAllMocks();
  });

  describe('getFromCache', () => {
    it('should return data from the cache if present', async () => {
      const mockResult = {
        Item: {
          "cacheKey": { S: mockKey },
          "data": { S: JSON.stringify({ id: 1, name: 'Test User' }) },
        },
      };

      dynamoDb.send = jest.fn().mockResolvedValue(mockResult);
      const result = await repo.getFromCache(mockKey);

      expect(dynamoDb.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: tableName,
            Key: {
              cacheKey: { S: mockKey },
            },
          },
        })
      );
      expect(result).toEqual(mockResult.Item);
    });

    it('should return an empty array if no data is found', async () => {
      const mockResult = {}; // No Item returned

      dynamoDb.send = jest.fn().mockResolvedValue(mockResult);

      const result = await repo.getFromCache(mockKey);

      expect(dynamoDb.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: tableName,
            Key: {
              cacheKey: { S: mockKey },
            },
          },
        })
      );
      expect(result).toEqual([]);
    });

    it('should throw an error if DynamoDB fails', async () => {
      const mockError = new Error('DynamoDB error');

      dynamoDb.send = jest.fn().mockRejectedValue(mockError);

      await expect(repo.getFromCache(mockKey)).rejects.toThrow(mockError);
      expect(dynamoDb.send).toHaveBeenCalled();
    });
  });

  describe('putInCache', () => {
    it('should store data in the cache successfully', async () => {
      const mockData = { id: 1, name: 'Test User' };
  
      // Mock the dynamoDb.send method
      dynamoDb.send = jest.fn().mockResolvedValue({}); // Simulate a successful response
  
      await repo.putInCache(mockKey, mockData);
  
      expect(dynamoDb.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            TableName: tableName,
            Item: {
              cacheKey: { S: mockKey },
              data: { S: JSON.stringify(mockData) },
            },
          },
        })
      );
    });

    it('should throw an error if DynamoDB fails', async () => {
      const mockData = { id: 1, name: 'Test User' };
      const mockError = new Error('DynamoDB error');

      dynamoDb.send = jest.fn().mockRejectedValue(mockError);

      await expect(repo.putInCache(mockKey, mockData)).rejects.toThrow(mockError);
      expect(dynamoDb.send).toHaveBeenCalled();
    });
  });
});

