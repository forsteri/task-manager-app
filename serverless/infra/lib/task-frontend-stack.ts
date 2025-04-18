import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class TaskFrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
