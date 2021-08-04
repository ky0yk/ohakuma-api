import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const tableName: string | undefined = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('テーブル名を取得できませんでした。');
}
const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
const ddbDocClient = ddbLib.DynamoDBDocumentClient.from(ddbClient);

type Bear = {
  name: string;
  info?: string;
  imageUrl?: string;
  [attr: string]: any;
};

export const getAllBears = async (): Promise<Bear[]> => {
  const params: ddbLib.ScanCommandInput = {
    TableName: tableName,
  };
  const data: ddbLib.ScanCommandOutput = await ddbDocClient.send(
    new ddbLib.ScanCommand(params)
  );
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
  return bearInfo as Bear;
};
