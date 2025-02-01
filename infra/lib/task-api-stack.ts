import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
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

    // S3バケットを作成
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: 'haji-task-manager-frontend-bucket', // 必要なら名前を指定
      publicReadAccess: false, // ファイルを公開する場合は true
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // 全てのパブリックアクセスをブロック
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 開発用: 削除時にバケットも削除
    });

    // フロントエンドのビルド済みファイルをアップロード
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset('../frontend')], // フロントエンドのビルドフォルダを指定
      destinationBucket: frontendBucket,
    });

    // CloudFrontディストリビューションを作成
    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'Haji-frontendOAC', {
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    const distribution = new cloudfront.Distribution(this, 'Haji-FrontendDistribution', {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: 
            cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
              frontendBucket
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
    });
    
    // CloudFrontのURLを出力
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The CloudFront distribution URL',
    });
  }
}
