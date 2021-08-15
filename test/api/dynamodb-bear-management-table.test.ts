import * as infra from '../../src/api/infrastructures/dynamodb/dynamodb-bear-management-table';
import { mockClient } from 'aws-sdk-client-mock';
import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { Bear } from '../../src/api/domains/bear-management/bear-management';
import { v4 as uuidv4 } from 'uuid';

const tableName = process.env.TABLE_NAME;
const ddbMock = mockClient(infra.ddbDocClient);

/**
 * 【担保できていること】
 * ドメイン層の関数の戻り値が想定通りであること
 * AWS SDKに渡されるパラメータが正しいこと
 */

describe('インフラ', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  test('全クマ情報の取得ができること', async () => {
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
    const res: Bear[] = await infra.getAllBears();
    console.log(ddbMock.calls.length);
    expect(res).toStrictEqual(expectedItems);
  });

  test('IDに対応するクマ情報の取得ができること', async () => {
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
    const res: Bear = await infra.getBear(inputId);
    console.log(res);
    expect(res).toStrictEqual(expectedItem);
  });

  test('クマ情報の作成ができること', async () => {
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
    const res: Bear = await infra.createBear(inputItem);
    console.log(res);
    expect(res).toStrictEqual(inputItem);
  });

  test('IDに対応するクマ情報の更新ができること', async () => {
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
    const res: Bear = await infra.updateBear(inputId, inputItem);
    console.log(res);
    expect(res).toStrictEqual(expectedItem);
  });

  test('IDに対応するクマ情報の削除ができること', async () => {
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
    const res: Bear = await infra.deleteBear(inputId);
    console.log(res);
    expect(res).toStrictEqual(expectedItem);
  });
});
