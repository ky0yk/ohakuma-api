import * as infra from '../../src/lambda/infrastructures/dynamodb/dynamodb-bear-management-table';
import { mockClient } from 'aws-sdk-client-mock';
import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Bear } from '../../src/lambda/domains/bear-management/bear-management';
import { v4 as uuidv4 } from 'uuid';

const ddbMock = mockClient(infra.ddbDocClient);

it('全クマ情報の取得ができること', async () => {
  const items: Bear[] = [
    { id: uuidv4(), name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' },
    { id: uuidv4(), name: 'シロクマ', info: '白いクマです' },
  ];
  ddbMock.on(ScanCommand).resolves({
    Items: items,
  });
  const response = await infra.getAllBears();
  expect(response).toStrictEqual(items);
});

it('IDに対応するクマ情報の取得ができること', async () => {
  const uuid = uuidv4();
  const item = { id: uuid, name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' };
  ddbMock.on(GetCommand).resolves({
    Item: item,
  });

  const response = await infra.getBear(uuid);
  console.log(response);
  expect(response).toStrictEqual(item);
});
