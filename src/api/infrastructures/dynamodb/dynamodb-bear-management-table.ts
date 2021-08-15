import { Bear } from '../../domains/bear-management/bear-management';
import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const tableName: string | undefined = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('テーブル名を取得できませんでした。');
}
export const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
export const ddbDocClient = ddbLib.DynamoDBDocumentClient.from(ddbClient);

export const getAllBears = async (): Promise<Bear[]> => {
  const params: ddbLib.ScanCommandInput = {
    TableName: tableName,
  };
  const data: ddbLib.ScanCommandOutput = await ddbDocClient.send(
    new ddbLib.ScanCommand(params)
  );
  console.log(data);
  return data.Items as Bear[];
};

export const getBear = async (bearId: string): Promise<Bear> => {
  const params: ddbLib.GetCommandInput = {
    TableName: tableName,
    Key: { id: bearId },
  };
  const data: ddbLib.GetCommandOutput = await ddbDocClient.send(
    new ddbLib.GetCommand(params)
  );
  return data.Item as Bear;
};

export const createBear = async (bearInfo: Bear): Promise<Bear> => {
  // UUIDの付与
  bearInfo.id = uuidv4();
  // DynamoDBへの登録
  const params: ddbLib.PutCommandInput = {
    TableName: tableName,
    Item: bearInfo,
  };
  const data: ddbLib.PutCommandOutput = await ddbDocClient.send(
    new ddbLib.PutCommand(params)
  );
  // TODO getBearで確認もいれる？
  return bearInfo as Bear;
};

export const updateBear = async (
  bearId: string,
  bearInfo: Bear
): Promise<Bear> => {
  // クエリの組み立て
  const updateExpression = Object.keys(bearInfo).map(
    (key) => `#att_${key} =:${key}`
  );
  const expressionAttributeNames = Object.fromEntries(
    Object.entries(bearInfo).map(([k, v]) => [`#att_${k}`, k])
  );
  const expressionAttributeValues = Object.fromEntries(
    Object.entries(bearInfo).map(([k, v]) => [`:${k}`, v])
  );
  // DynamoDBへの登録
  const params: ddbLib.UpdateCommandInput = {
    TableName: tableName,
    Key: {
      id: bearId,
    },
    UpdateExpression: `set ${updateExpression.join()}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };
  console.log(params);
  const result: ddbLib.UpdateCommandOutput = await ddbDocClient.send(
    new ddbLib.UpdateCommand(params)
  );
  return result.Attributes as Bear;
};

export const deleteBear = async (bearId: string) => {
  const params: ddbLib.DeleteCommandInput = {
    TableName: tableName,
    Key: {
      id: bearId,
    },
    ReturnValues: 'ALL_OLD',
  };
  const result: ddbLib.DeleteCommandOutput = await ddbDocClient.send(
    new ddbLib.DeleteCommand(params)
  );
  return result.Attributes as Bear;
};
