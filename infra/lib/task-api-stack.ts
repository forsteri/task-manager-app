import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { TaskDatabaseStack } from './task-database-stack';

export class TaskApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: { databaseStack: TaskDatabaseStack } & cdk.StackProps) {
    super(scope, id, props);

    const taskTable = props.databaseStack.taskTable;

    // Lambda関数を作成
    const createTaskLambda = new lambda.Function(this, 'CreateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('../lambda/dist'),
      handler: 'create-task.handler',
      environment: {
        TABLE_NAME: taskTable.tableName,
      },
    });

    const updateTaskLambda = new lambda.Function(this, 'UpdateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('../lambda/dist'),
      handler: 'update-task.handler',
      environment: {
        TABLE_NAME: taskTable.tableName,
      },
    });

    const deleteTaskLambda = new lambda.Function(this, 'DeleteTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('../lambda/dist'),
      handler: 'delete-task.handler',
      environment: {
        TABLE_NAME: taskTable.tableName,
      },
    });

    const listTasksLambda = new lambda.Function(this, 'ListTasksFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('../lambda/dist'),
      handler: 'list-tasks.handler',
      environment: {
        TABLE_NAME: taskTable.tableName,
      },
    });

    // Lambda関数にDynamoDBへの権限を付与
    taskTable.grantWriteData(createTaskLambda);
    taskTable.grantWriteData(updateTaskLambda);
    taskTable.grantWriteData(deleteTaskLambda);
    taskTable.grantReadData(listTasksLambda); // タスク一覧用に読み取り権限を追加
    taskTable.grantReadData(updateTaskLambda); // タスク更新用に読み取り/書き込み権限を追加

    // API Gatewayを作成
    const api = new apigateway.RestApi(this, 'TaskApi', {
      restApiName: 'Task Management API',
      description: 'This service handles task operations.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const tasksResource = api.root.addResource('tasks');
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(createTaskLambda));
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(listTasksLambda)); // タスク一覧取得用GETメソッドを追加

    const taskResource = tasksResource.addResource('{taskId}');
    taskResource.addMethod('PATCH', new apigateway.LambdaIntegration(updateTaskLambda));
    taskResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTaskLambda));
  }
}
