import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class TaskApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDBテーブルを作成
    const taskTable = new dynamodb.Table(this, 'TaskTable', {
      partitionKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 開発用環境では DESTROY、本番環境では RETAIN を推奨
    });

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

    // Lambda関数にDynamoDBへの書き込み権限を付与
    taskTable.grantWriteData(createTaskLambda);
    taskTable.grantWriteData(updateTaskLambda);
    taskTable.grantWriteData(deleteTaskLambda);

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

    const taskResource = tasksResource.addResource('{taskId}');
    taskResource.addMethod('PATCH', new apigateway.LambdaIntegration(updateTaskLambda));
    taskResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTaskLambda));
  }
}
