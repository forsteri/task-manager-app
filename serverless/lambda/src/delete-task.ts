import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDb = new DynamoDBClient({ region: 'ap-northeast-1' });
const tableName = process.env.TABLE_NAME || '';
const headers: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PATCH, DELETE",
  "Access-Control-Allow-Headers": "Content-Type"
};

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const taskId = event.pathParameters?.taskId;
  if (!taskId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Task ID is required' }),
    };
  }

  const params = {
    TableName: tableName,
    Key: {
      taskId: { S: taskId },
    },
  };

  try {
    await dynamoDb.send(new DeleteItemCommand(params));
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        message: 'Task deleted successfully',
        taskId: taskId,
      }),
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        message: 'Failed to delete task',
        error: (error as Error).message,
      }),
    };
  }
};
