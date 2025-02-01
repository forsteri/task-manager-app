import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
//import { v4 as uuidv4 } from 'uuid';

// UUID生成関数
const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const dynamoDb = new DynamoDBClient({ region: 'ap-northeast-1' });
const tableName = process.env.TABLE_NAME || '';

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    //const taskId = uuidv4();
    const taskId = generateUuid();

    const createdAt = new Date().toISOString();

    const taskItem = {
      taskId: { S: taskId },
      title: { S: body.title },
      description: { S: body.description || '' },
      createdAt: { S: createdAt }
    };

    await dynamoDb.send(new PutItemCommand({
      TableName: tableName,
      Item: taskItem
    }));

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PATCH, DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        message: 'Task created successfully!',
        task: taskItem
      })
    };

  } catch (error) {
    console.error('Error creating task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to create task',
        error: (error as Error).message
      })
    };
  }
};
