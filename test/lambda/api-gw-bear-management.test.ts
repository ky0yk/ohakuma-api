import * as http from 'http';
import request = require('supertest');
const app = require('../../src/lambda/handlers//api-gw/app');
import * as ddb from '../../src/lambda/infrastructures/dynamodb/dynamodb-bear-management-table';

jest.mock(
  '../../src/lambda/infrastructures/dynamodb/dynamodb-bear-management-table'
);

describe('ユースケース', () => {
  let server: http.Server;
  beforeEach(() => {
    server = app.listen(3000);
  });
  afterEach(() => {
    server.close();
  });

  test('ヘルスチェックAPIが利用できる', async () => {
    const res: request.Response = await request(server).get('/');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ message: 'API is working!' });
  });

  test('全クマ情報の取得ができること', async () => {
    const getBearsMock = (ddb.getAllBears as jest.Mock).mockResolvedValue(null);
    const res: request.Response = await request(server).get('/bears');
    expect(getBearsMock.mock.calls.length).toBe(1);
    expect(res.status).toEqual(200);
  });

  test('IDに対応するクマ情報の取得ができること', async () => {
    const inputId = '0fe0fa77-2499-b391-2e10-8b32f7bc44d8';
    const getBearsMock = (ddb.getBear as jest.Mock).mockResolvedValue({
      id: inputId,
      name: 'ヒグマ',
      info: 'ヒトはヒグマに勝てねえ',
    });
    const res: request.Response = await request(server).get(
      `/bears/${inputId}`
    );
    expect(getBearsMock.mock.calls.length).toBe(1);
    expect(getBearsMock.mock.calls[0][0]).toEqual(inputId);
    expect(res.status).toEqual(200);
  });

  test('クマ情報の作成ができること', async () => {
    const inputItem = {
      name: 'ヒグマ',
      info: 'ヒトはヒグマに勝てねえ',
    };
    const expectedItem = {
      id: '0fe0fa77-2499-b391-2e10-8b32f7bc44d8',
      name: 'ヒグマ',
      info: 'ヒトはヒグマに勝てねえ',
    };
    const getBearsMock = (ddb.createBear as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .post(`/bears`)
      .send(inputItem);
    expect(getBearsMock.mock.calls.length).toBe(1);
    expect(getBearsMock.mock.calls[0][0]).toEqual(inputItem);
    expect(res.status).toEqual(201);
  });

  test('IDに対応するクマ情報の更新ができること', async () => {
    const inputId = '0fe0fa77-2499-b391-2e10-8b32f7bc44d8';
    const inputItem = {
      name: 'ヒグマ',
      info: 'なっちまえばいいじゃん。羆に',
    };
    const getBearsMock = (ddb.updateBear as jest.Mock).mockResolvedValue({
      id: inputId,
      name: 'ヒグマ',
      info: 'なっちまえばいいじゃん。羆に',
    });
    const res: request.Response = await request(server)
      .put(`/bears/${inputId}`)
      .send(inputItem);
    expect(getBearsMock.mock.calls.length).toBe(1);
    expect(getBearsMock.mock.calls[0][0]).toEqual(inputId);
    expect(getBearsMock.mock.calls[0][1]).toEqual(inputItem);
    expect(res.status).toEqual(200);
  });
});
