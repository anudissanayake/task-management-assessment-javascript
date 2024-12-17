/* eslint-disable no-undef */
import { jest } from '@jest/globals';

// Import the function and dependencies
import { DynamoDBTaskRepository } from '../../src/infrastructure/database/DynamoDBTaskRepository.js';
import { TaskController } from '../../src/controllers/TaskController.js';
import { TaskService } from '../../src/services/TaskService.js';
import { FileUploadService } from '../../src/services/FileUploadService.js';

jest.mock('../../src/services/TaskService.js');
jest.mock('../../src/services/FileUploadService.js');

describe('TaskController', () => {
  let taskService;
  let fileUploadService;
  let taskController;
  let req;
  let res;
  let next;

  beforeEach(() => {
    taskService = new TaskService(new DynamoDBTaskRepository());
    fileUploadService = new FileUploadService();

    taskService.createTask = jest.fn();
    fileUploadService.uploadFile = jest.fn();
    taskService.getTasks = jest.fn();
    taskService.getTaskById = jest.fn();
    taskService.updateTask = jest.fn();
    taskService.deleteTask = jest.fn();
    fileUploadService.deleteFile = jest.fn();

    taskController = new TaskController(taskService, fileUploadService);

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  describe('createTask', () => {
    it('should create a task and return 201', async () => {
    const fileUrl = 'https://task-file-bucket-mumbai.s3.us-east-1.amazonaws.com/1733684781125-TestFile.docx';

      req.body = { title: 'Test Task', description: 'Test Description' };
      req.file = {
        buffer: Buffer.from('test file'),
        originalname: 'file.txt',
        mimetype: 'text/plain',
      };

      fileUploadService.uploadFile.mockResolvedValue(fileUrl);
      taskService.createTask.mockResolvedValue({'$metadata': {httpStatusCode: 200}});

      await taskController.createTask(req, res, next);

      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          description: 'Test Description',
          fileUrl,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.any(Object)});
    });

    it('should call next with an error on failure', async () => {
        req.body = { title: 'Test Task', description: 'Test Description' };

        taskService.createTask.mockResolvedValue({'$metadata': {httpStatusCode: 500}});

        await taskController.createTask(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Failed to create the task');
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
  });


  describe('getTasks', () => {
    it('should return tasks with status 200', async () => {
      const tasks = [{ id: '1', title: 'Test', description: '', status: 'pending', createdAt: '', updatedAt: '' }];
      taskService.getTasks.mockResolvedValue(tasks);

      await taskController.getTasks(req, res, next);

      expect(taskService.getTasks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.any(Array)});
    });

    it('should return status 404 if no tasks are found', async () => {
        taskService.getTasks.mockResolvedValue([]);

        await taskController.getTasks({}, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Tasks not found');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return a task with status 200', async () => {
      const task = { id: '1', title: 'Test', description: '', status: 'pending', createdAt: '', updatedAt: '' };
      req.params = { id: '1' };
      taskService.getTaskById.mockResolvedValue(task);

      await taskController.getTaskById(req, res, next);

      expect(taskService.getTaskById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: task});
    });

    it('should return status 404 if task not found', async () => {
      req.params = { id: '4' };
      taskService.getTaskById.mockResolvedValue(null);
      await taskController.getTaskById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Task not found');
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();

    });

    it('should call next with error on failure', async () => {
      req.params = { id: '1' };
      taskService.getTaskById.mockRejectedValue(new Error('Error'));

      await taskController.getTaskById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateTask', () => {
    it('should update a task and return 200', async () => {
      const existingTask = { id: '1', title: 'Old', description: '', status: 'pending', createdAt: '', updatedAt: '' };
      req.params = { id: '1' };
      req.body = { title: 'New' };
      taskService.getTaskById.mockResolvedValue(existingTask);
      taskService.updateTask.mockResolvedValue({'$metadata': {httpStatusCode: 200}});

      await taskController.updateTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: expect.any(Object)});
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and return 200', async () => {
      const task = { id: '1', title: 'Test', description: '', status: 'pending', createdAt: '', updatedAt: ''};
      req.params = { id: '1' };
      taskService.getTaskById.mockResolvedValue(task);
      await taskController.deleteTask(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Task Deleted successfully" });
    });

    it('should delete a task, delete file in S3 and return 200', async () => {
        const task = { id: '1', title: 'Test', description: '', status: 'pending', createdAt: '', updatedAt: '', fileUrl: 'http://example.com/file.txt' };
        req.params = { id: '1' };
        taskService.getTaskById.mockResolvedValue(task);
        await taskController.deleteTask(req, res, next);
  
        const key = new URL(task.fileUrl).pathname.substring(1);
        //Delete S3 file
        expect(fileUploadService.deleteFile).toHaveBeenCalledWith(key);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Task Deleted successfully" });
      });
  });
});
