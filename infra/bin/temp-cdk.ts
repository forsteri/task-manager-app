#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
// import { TempCdkStack } from '../lib/temp-cdk-stack';
import { TaskApiStack } from '../lib/task-api-stack';

const app = new cdk.App();

new TaskApiStack(app, 'TaskApiStack', {
  env: {
    region: 'ap-northeast-1'
  }
});