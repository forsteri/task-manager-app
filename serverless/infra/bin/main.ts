import * as cdk from 'aws-cdk-lib';
import { TaskDatabaseStack } from '../lib/task-database-stack';
import { TaskApiStack } from '../lib/task-api-stack';
import { TaskFrontendStack } from '../lib/task-frontend-stack';

const app = new cdk.App();

const databaseStack = new TaskDatabaseStack(app, 'TaskDatabaseStack');
const apiStack = new TaskApiStack(app, 'TaskApiStack', { databaseStack });
const frontendStack = new TaskFrontendStack(app, 'TaskFrontendStack');
