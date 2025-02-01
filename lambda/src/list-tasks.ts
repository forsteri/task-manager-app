import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDb = new DynamoDBClient({ region: 'ap-northeast-1' });
const tableName = process.env.TABLE_NAME || '';
const headers: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PATCH, DELETE",
  "Access-Control-Allow-Headers": "Content-Type"
};

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
      headers: headers,
      body: JSON.stringify({
        message: 'Tasks retrieved successfully',
        tasks,
      }),
    };
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({
        message: 'Failed to retrieve tasks',
        error: (error as Error).message,
      }),
    };
  }
};
