import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoDb = new DynamoDBClient({ region: 'ap-northeast-1' });
const tableName = process.env.TABLE_NAME || '';

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
      body: JSON.stringify({
        message: 'Task deleted successfully',
        taskId: taskId,
      }),
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to delete task',
        error: (error as Error).message,
      }),
    };
  }
};
