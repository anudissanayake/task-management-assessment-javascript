import { Router } from 'express';
import multer from 'multer';

import { TaskController } from '../controllers/TaskController.js';
import { TaskService } from '../services/TaskService.js';
import { FileUploadService } from '../services/FileUploadService.js';
import { DynamoDBTaskRepository } from '../infrastructure/database/DynamoDBTaskRepository.js';
import { validateTask, validateUpdateTask } from '../infrastructure/middlewares/ValidateTask.js'
const dbRepository = new DynamoDBTaskRepository();
const taskService = new TaskService(dbRepository);
const fileUploadService = new FileUploadService();
const taskController = new TaskController(taskService, fileUploadService);

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const taskRoutes = Router();

taskRoutes.post('/', upload.single('file'), validateTask, taskController.createTask);
taskRoutes.get('/', taskController.getTasks);
taskRoutes.get('/:id', taskController.getTaskById);
taskRoutes.put('/:id', upload.single('file'), validateUpdateTask, taskController.updateTask);
taskRoutes.delete('/:id', taskController.deleteTask);

export default taskRoutes;