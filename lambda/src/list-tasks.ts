import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDb = new DynamoDBClient({ region: 'ap-northeast-1' });
const tableName = process.env.TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const params = {
      TableName: tableName,
    };

    const result = await dynamoDb.send(new ScanCommand(params));

    const tasks = result.Items?.map((item) => ({
      taskId: item.taskId?.S || 'Unknown ID',
      title: item.title?.S || 'No Title',
      description: item.description?.S || 'No Description',
      createdAt: item.createdAt?.S || 'Unknown Date',
    })) || [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Tasks retrieved successfully',
        tasks,
      }),
    };
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to retrieve tasks',
        error: (error as Error).message,
      }),
    };
  }
};
