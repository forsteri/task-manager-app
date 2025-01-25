import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

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

  const params = {
    TableName: tableName,
    Key: {
      taskId: { S: taskId },
    },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: 'ALL_NEW' as const, // 更新後のデータを返す
  };

  try {
    const result = await dynamoDb.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task updated successfully',
        updatedTask: result.Attributes,
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
