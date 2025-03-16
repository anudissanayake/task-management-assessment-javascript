/* eslint-disable no-undef */
import { jest } from '@jest/globals';
import { TaskService } from '../../src/services/TaskService.js';
import { DynamoDBTaskRepository } from '../../src/infrastructure/database/DynamoDBTaskRepository.js';
import { FileUploadService } from '../../src/services/FileUploadService.js';
import { Task } from '../../src/core/domain/models/TaskModel.js';
import { generateId } from '../../src/utils/generateId.js';

jest.mock('../../src/infrastructure/database/DynamoDBTaskRepository.js');
jest.mock('../../src/services/FileUploadService.js');

describe('TaskService', () => {
  let taskService;
  let dbRepository;
  let fileUploadService;

  beforeEach(() => {
    dbRepository = new DynamoDBTaskRepository();
    fileUploadService = new FileUploadService();
    taskService = new TaskService(dbRepository, fileUploadService);

    dbRepository.create = jest.fn();
    dbRepository.findAll = jest.fn();
    dbRepository.findById = jest.fn();
    dbRepository.update = jest.fn();
    dbRepository.delete = jest.fn();
    fileUploadService.uploadFile = jest.fn();
    fileUploadService.deleteFile = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  describe('createTask', () => {
    it('should create a task and return it', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' };
      const file = { buffer: Buffer.from('test file'), originalname: 'file.txt', mimetype: 'text/plain' };
      const fileUrl = 'https://s3.amazonaws.com/test-bucket/test-file.txt';
      const task = new Task(generateId(), taskData.title, taskData.description);
      task.fileUrl = fileUrl;

      fileUploadService.uploadFile.mockResolvedValue(fileUrl);
      dbRepository.create.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const createdTask = await taskService.createTask(taskData, file);

      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(file);
      expect(dbRepository.create).toHaveBeenCalledWith(expect.any(Task));
      expect(createdTask).toEqual(expect.any(Task));
    });
  });

  describe('getTasks', () => {
    it('should return all tasks', async () => {
      const tasks = [{ id: '1', title: 'Test', description: '' }];
      dbRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getTasks();

      expect(dbRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(tasks);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      const task = { id: '1', title: 'Test' };
      dbRepository.findById.mockResolvedValue(task);

      const result = await taskService.getTaskById('1');

      expect(dbRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(task);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const uuid = '1';
      const existingTask = { id: uuid, title: 'Old', description: '' };
      const updatedData = { title: 'New' };
      const updatedTask = { ...existingTask, ...updatedData, updatedAt: expect.any(String) };
      dbRepository.findById.mockResolvedValue(existingTask);
      dbRepository.update.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const result = await taskService.updateTask(uuid, updatedData);

      expect(dbRepository.findById).toHaveBeenCalledWith(uuid);
      expect(dbRepository.update).toHaveBeenCalledWith(expect.objectContaining(updatedTask));
      expect(result).toEqual(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const id = '1';
      const task = { id, fileUrl: 'https://s3.amazonaws.com/test-bucket/test-file.txt' };
      dbRepository.findById.mockResolvedValue(task);

      await taskService.deleteTask(id);

      expect(dbRepository.delete).toHaveBeenCalledWith(id);
      expect(fileUploadService.deleteFile).toHaveBeenCalledWith(expect.any(String));
    });
  });
});