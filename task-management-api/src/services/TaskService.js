// This file defines all the task services
import { Task } from '../core/domain/models/TaskModel.js';
import { generateId } from '../utils/generateId.js';

export class TaskService {
  constructor(dbRepository, fileUploadService) {
    this.dbRepository = dbRepository;
    this.fileUploadService = fileUploadService;
  }

  async createTask(taskData, file) {
    const task = new Task(generateId(), taskData.title, taskData.description);
    file && (task.fileUrl = await this.fileUploadService.uploadFile(file));
    const createdTask = await this.dbRepository.create(task);
    if (createdTask.$metadata.httpStatusCode !== 200) {
      const error = new Error('Failed to create the task');
      error.statusCode = 500;
      throw error;
    }
    return task;
  }

  async getTasks() {
    return await this.dbRepository.findAll(); // Calls the repository method to retrieve all tasks
  }

  async getTaskById(id) {
    return await this.dbRepository.findById(id); // Calls the repository method to retrieve task by id
  }

  async updateTask(uuid, taskData) {
    const taskExist = await this.dbRepository.findById(uuid);
    // If the task does not exist, return a 404 Not Found
    if (!taskExist) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    const updatedTask = {
      ...taskExist,
      ...taskData,
      updatedAt: new Date().toISOString(),
      status: taskData.status || taskExist.status,
    };
    const updated = await this.dbRepository.update(updatedTask); // Calls the repository method to update the task
    if (updated.$metadata.httpStatusCode !== 200) {
      const error = new Error('Failed to update the task');
      error.statusCode = 500;
      throw error;
    }
    return updatedTask;
  }

  async deleteTask(id) {
    const taskExist = await this.dbRepository.findById(id);
    // If the task does not exist, return a 404 Not Found
    if (!taskExist) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    await this.dbRepository.delete(id); // Calls the repository method to delete the task by id

    if (taskExist?.fileUrl) {
      const key = new URL(taskExist.fileUrl).pathname.substring(1);
      await this.fileUploadService.deleteFile(key);
    }
  }
}
