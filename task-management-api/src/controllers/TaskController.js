import { Task } from '../core/domain/models/TaskModel.js';
import { generateId } from '../utils/generateId.js';

/**
 * Implemented CRUD operations for Task
 */
export class TaskController {
  constructor(taskService, fileUploadService) {
    this.taskService = taskService;
    this.fileUploadService = fileUploadService;
  }

  /**
  * @param {Object} req 
  * @param {string} req.body.title 
  * @param {string} req.body.description
  * @param {file} req.file
  * @param {Object} res - object with 201 status code
   */
  createTask = async (req, res, next) => {
    try {
      const { title, description } = req.body;
      const task = new Task(generateId(), title, description);
      if (req.file) {
        const fileBuffer = req.file.buffer;       // Extract file buffer
        const fileName = req.file.originalname;   // Extract original file name
        const mimeType = req.file.mimetype;       // Extract MIME type

        const fileUrl = await this.fileUploadService.uploadFile(fileBuffer, fileName, mimeType);
        task.fileUrl = fileUrl;
      }
      const createdTask = await this.taskService.createTask(task);
      
      if (createdTask.$metadata.httpStatusCode !== 200) {
        const error = new Error('Failed to create the task');
        error.statusCode = 500;
        throw error;
      }
      res.status(201).json({ success: true, data: task });

    } catch (error) {
      next(error);
    }
  };

  /**
   * @param {Request} req 
   * @param {Response} res - Task array with 200 status code
   */
  getTasks = async (_req, res, next) => {
    try {
      const tasks = await this.taskService.getTasks();
      if (!tasks || tasks.length === 0) {
        const error = new Error('Tasks not found');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param {Request} req 
   * @param {string} req.params.id 
   * @param {Response} res - Task object with 200 status code
   */
  getTaskById = async (req, res, next) => {
    try {
      const uuid = req.params.id; 
      const task = await this.taskService.getTaskById(uuid);
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

    /**
   * @param {Request} req 
   * @param {string} req.body.title 
   * @param {string} req.body.description
   * @param {file} req.file
   * @param {Response} res - object with 200 status code
   */
  updateTask = async (req, res, next) => {
    try {
      const uuid = req.params.id;
      const { title, description, status } = req.body;
      let fileUrl;

      const taskExist = await this.taskService.getTaskById(uuid);

      // If the task does not exist, return a 404 Not Found
      if (!taskExist) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      // S3 file upload
      if (req.file) {
        const fileBuffer = req.file.buffer; // Extract file buffer
        const fileName = req.file.originalname; // Extract original file name
        const mimeType = req.file.mimetype; // Extract MIME type

        // Upload file to S3
        fileUrl = await this.fileUploadService.uploadFile(fileBuffer, fileName, mimeType);
      }

      const task = {
        ...taskExist,
        title: title || taskExist.title,
        description: description || taskExist.description,
        status: status || taskExist.status,
        fileUrl: fileUrl || taskExist.fileUrl,
        updatedAt: new Date().toISOString(),
      };
      //update task
      const updatedTask = await this.taskService.updateTask(task);
      if (updatedTask.$metadata.httpStatusCode === 200) {
        res.status(200).json({ success: true, data: task });

      } else {
        const error = new Error('Failed to update the task');
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param {Request} req 
   * @param {string} req.params.id 
   * @param {Response} res - object with 200 status code
   */
  deleteTask = async (req, res, next) => {
    try {
      const uuid = req.params.id;
      const taskExist = await this.taskService.getTaskById(uuid);

      // If the task does not exist, return a 404 Not Found
      if (!taskExist) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }

      await this.taskService.deleteTask(uuid);

      if (taskExist?.fileUrl) {
        const key = new URL(taskExist.fileUrl).pathname.substring(1);
        await this.fileUploadService.deleteFile(key);
      }
      res.status(200).json({ success: true, message: "Task Deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

}