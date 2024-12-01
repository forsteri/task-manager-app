import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class TempCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    new s3.Bucket(this, 'Haji-TempTestBucket', {
      versioned: false, // バージョニングを無効化（テスト用に簡素化）
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にバケットも削除
      autoDeleteObjects: true, // オブジェクトも一緒に削除
    });
  }
}
