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
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にDynamoDBも削除
    });

    // Lambda関数を作成
    const createTaskLambda = new lambda.Function(this, 'CreateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'create-task.handler', // ファイル名とエクスポートする関数名
      environment: {
        TABLE_NAME: taskTable.tableName
      }
    });

    // Lambda関数にDynamoDBへの書き込み権限を付与
    taskTable.grantWriteData(createTaskLambda);

    // API Gatewayを作成し、POST /tasks へのリクエストをLambdaに送信
    const api = new apigateway.RestApi(this, 'TaskApi', {
      restApiName: 'Task Management API',
      description: 'This service handles task creation.'
    });

    const tasksResource = api.root.addResource('tasks'); // /tasksエンドポイントを追加
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(createTaskLambda));
  }
}
