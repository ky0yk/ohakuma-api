import * as infra from '../../src/lambda/infrastructures/dynamodb/dynamodb-bear-management-table';
import { mockClient } from 'aws-sdk-client-mock';
import {
  GetCommand,
  ScanCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { Bear } from '../../src/lambda/domains/bear-management/bear-management';
import { v4 as uuidv4 } from 'uuid';

const tableName = process.env.TABLE_NAME;

const ddbMock = mockClient(infra.ddbDocClient);

it('全クマ情報の取得ができること', async () => {
  const items: Bear[] = [
    { id: uuidv4(), name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' },
    { id: uuidv4(), name: 'シロクマ', info: '白いクマです' },
  ];
  ddbMock
    .on(ScanCommand, {
      TableName: tableName,
    })
    .resolves({
      Items: items,
    });
  const response = await infra.getAllBears();
  expect(response).toStrictEqual(items);
});

it('IDに対応するクマ情報の取得ができること', async () => {
  const uuid = uuidv4();
  const item = { id: uuid, name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' };
  ddbMock
    .on(GetCommand, {
      TableName: tableName,
      Key: { id: uuid },
    })
    .resolves({
      Item: item,
    });
  const response = await infra.getBear(uuid);
  console.log(response);
  expect(response).toStrictEqual(item);
});

it('クマ情報の作成ができること', async () => {
  const item = { id: uuidv4(), name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' };
  ddbMock
    .on(PutCommand, {
      TableName: tableName,
      Item: item,
    })
    .resolves({
      Attributes: item,
    });
  const response = await infra.createBear(item);
  console.log(response);
  expect(response).toStrictEqual(item);
});

it('IDに対応するクマ情報の更新ができること', async () => {
  const uuid = uuidv4();
  const item = { name: 'パンダ', info: '大熊猫' };
  const updatedItem = { id: uuid, name: 'パンダ', info: '大熊猫' };
  ddbMock
    .on(UpdateCommand, {
      TableName: tableName,
      Key: { id: uuid },
      UpdateExpression: 'set #att_name =:name,#att_info =:info',
      ExpressionAttributeNames: { '#att_name': 'name', '#att_info': 'info' },
      ExpressionAttributeValues: { ':name': 'パンダ', ':info': '大熊猫' },
      ReturnValues: 'ALL_NEW',
    })
    .resolves({
      Attributes: updatedItem,
    });
  const response = await infra.updateBear(uuid, item);
  console.log(response);
  expect(response).toStrictEqual(updatedItem);
});
