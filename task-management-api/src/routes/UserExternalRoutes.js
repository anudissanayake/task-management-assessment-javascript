import { Router } from 'express';

import { UserExternalApiController } from '../controllers/UserExternalApiController.js';
import { UserExternalApiService } from '../services/UserExternalApiService.js';
import { DynamoDBExternalRepository } from '../infrastructure/database/DynamoDBExternalRepository.js'

const dbRepository = new DynamoDBExternalRepository();
const userService = new UserExternalApiService(dbRepository);

const userController = new UserExternalApiController(userService);

const userRoutes = Router();

userRoutes.get('/', userController.getUsers);

export default userRoutes;