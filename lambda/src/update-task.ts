import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDb = new DynamoDBClient({ region: 'ap-northeast-1' });
const tableName = process.env.TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  const taskId = event.pathParameters?.taskId;
  if (!taskId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Task ID is required' }),
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { title, description } = body;

  if (!title && !description) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'At least one field (title or description) must be provided for update' }),
    };
  }

  // DynamoDB UpdateExpression
  const updateExpression = [];
  const expressionAttributeValues: { [key: string]: any } = {};
  const expressionAttributeNames: { [key: string]: any } = {};

  if (title) {
    updateExpression.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = { S: title };
  }

  if (description) {
    updateExpression.push('#description = :description');
    expressionAttributeNames['#description'] = 'description';
    expressionAttributeValues[':description'] = { S: description };
  }

  try {
    // DynamoDBから現在のタスクデータを取得
    const existingItem = await dynamoDb.send(
      new GetItemCommand({
        TableName: tableName,
        Key: { taskId: { S: taskId } },
      })
    );
    console.log('Existing Item:', JSON.stringify(existingItem, null, 2)); // デバッグ: 取得したデータ


    // `createdAt`を保持する
    if (existingItem.Item && existingItem.Item.createdAt) {
      const createdAtValue = existingItem.Item.createdAt.S;
      console.log('CreatedAt Value:', createdAtValue); // デバッグ: createdAtの値

      if (createdAtValue) {
        expressionAttributeValues[':createdAt'] = { S: createdAtValue }; // 修正: createdAtはそのまま設定
        expressionAttributeNames['#createdAt'] = 'createdAt';
        updateExpression.push('#createdAt = :createdAt');
      }
    }
    console.log('UpdateExpression:', updateExpression); // デバッグ: UpdateExpressionの内容
    console.log('ExpressionAttributeValues:', expressionAttributeValues); // デバッグ: AttributeValues
    console.log('ExpressionAttributeNames:', expressionAttributeNames); // デバッグ: AttributeNames  

    // UpdateItemCommand用のparamsをここで更新
    const params = {
      TableName: tableName,
      Key: {
        taskId: { S: taskId },
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW' as const,
    };

    console.log('DynamoDB Update Params:', params); // デバッグ: Updateのパラメータ
    const result = await dynamoDb.send(new UpdateItemCommand(params));
    console.log('DynamoDB Update Result:', result); // デバッグ: Updateの結果

    const updatedTask = {
      taskId: result.Attributes?.taskId?.S || taskId,
      title: result.Attributes?.title?.S || 'No Title',
      description: result.Attributes?.description?.S || 'No Description',
      createdAt: result.Attributes?.createdAt?.S || 'Unknown Date',
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task updated successfully',
        updatedTask,
      }),
    };
  } catch (error) {
    console.error('Error updating task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update task',
        error: (error as Error).message,
      }),
    };
  }
};
