import express from 'express';

import taskRoutes from './routes/TaskRoutes.js';
import userRoutes from './routes/UserExternalRoutes.js';
import errorHandler from './infrastructure/middlewares/ErrorHandler.js';



const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

app.use(errorHandler); // Error handling middleware

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For the AWS Lambda handler
export default app;
