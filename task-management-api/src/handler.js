import serverlessExpress from '@vendia/serverless-express';
import app from './server.js';

// Create the serverless handler
export const handler = serverlessExpress({ app });

