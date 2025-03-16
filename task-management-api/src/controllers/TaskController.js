/**
 * Implemented CRUD operations for Task
 */
export class TaskController {
  constructor(taskService) {
    this.taskService = taskService;
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
      const createdTask = await this.taskService.createTask(req.body, req.file);
      res.status(201).json({ success: true, data: createdTask });
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
      //update task
      const updatedTask = await this.taskService.updateTask(uuid, req.body);
      res.status(200).json({ success: true, data: updatedTask });
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
      await this.taskService.deleteTask(uuid);
      res.status(200).json({ success: true, message: "Task Deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

}