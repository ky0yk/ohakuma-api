import * as infra from '../../src/lambda/infrastructures/dynamodb/dynamodb-bear-management-table';
import { mockClient } from 'aws-sdk-client-mock';
import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { Bear } from '../../src/lambda/domains/bear-management/bear-management';
import { v4 as uuidv4 } from 'uuid';

const tableName = process.env.TABLE_NAME;

const ddbMock = mockClient(infra.ddbDocClient);

it('全クマ情報の取得ができること', async () => {
  const expectedItems: Bear[] = [
    { id: uuidv4(), name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' },
    { id: uuidv4(), name: 'シロクマ', info: '白いクマです' },
  ];
  ddbMock
    .on(ddbLib.ScanCommand, {
      TableName: tableName,
    })
    .resolves({
      Items: expectedItems,
    });
  const response = await infra.getAllBears();
  expect(response).toStrictEqual(expectedItems);
});

it('IDに対応するクマ情報の取得ができること', async () => {
  const inputId = uuidv4();
  const expectedItem: Bear = {
    id: inputId,
    name: 'ヒグマ',
    info: 'ヒトはヒグマに勝てねえ',
  };
  ddbMock
    .on(ddbLib.GetCommand, {
      TableName: tableName,
      Key: { id: inputId },
    })
    .resolves({
      Item: expectedItem,
    });
  const response = await infra.getBear(inputId);
  console.log(response);
  expect(response).toStrictEqual(expectedItem);
});

it('クマ情報の作成ができること', async () => {
  const inputItem = {
    id: uuidv4(),
    name: 'ヒグマ',
    info: 'ヒトはヒグマに勝てねえ',
  };
  ddbMock
    .on(ddbLib.PutCommand, {
      TableName: tableName,
      Item: inputItem,
    })
    .resolves({
      Attributes: inputItem,
    });
  const response = await infra.createBear(inputItem);
  console.log(response);
  expect(response).toStrictEqual(inputItem);
});

it('IDに対応するクマ情報の更新ができること', async () => {
  const inputId = uuidv4();
  const inputItem = { name: 'パンダ', info: '大熊猫' };
  const expectedItem = { id: inputId, name: 'パンダ', info: '大熊猫' };
  ddbMock
    .on(ddbLib.UpdateCommand, {
      TableName: tableName,
      Key: { id: inputId },
      UpdateExpression: 'set #att_name =:name,#att_info =:info',
      ExpressionAttributeNames: { '#att_name': 'name', '#att_info': 'info' },
      ExpressionAttributeValues: { ':name': 'パンダ', ':info': '大熊猫' },
      ReturnValues: 'ALL_NEW',
    })
    .resolves({
      Attributes: expectedItem,
    });
  const response = await infra.updateBear(inputId, inputItem);
  console.log(response);
  expect(response).toStrictEqual(expectedItem);
});

it('IDに対応するクマ情報の削除ができること', async () => {
  const inputId = uuidv4();
  const expectedItem = { id: inputId, name: 'グリズリー', info: '灰色熊' };
  ddbMock
    .on(ddbLib.DeleteCommand, {
      TableName: tableName,
      Key: {
        id: inputId,
      },
      ReturnValues: 'ALL_OLD',
    })
    .resolves({
      Attributes: expectedItem,
    });
  const response = await infra.deleteBear(inputId);
  console.log(response);
  expect(response).toStrictEqual(expectedItem);
});
