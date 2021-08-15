import * as http from 'http';
import request = require('supertest');
const app = require('../../src/api/handlers//api-gw/app');
import * as infra from '../../src/api/infrastructures/dynamodb/dynamodb-bear-management-table';
import { v4 as uuidv4 } from 'uuid';
import { Bear } from '../../src/api/domains/bear-management/bear-management';

jest.mock(
  '../../src/api/infrastructures/dynamodb/dynamodb-bear-management-table'
);

/**
 * 【担保できていること】
 * ドメイン層の関数の戻り値が想定通りであること
 * ドメイン層の関数に紐づくインフラ層の関数が一度だけ呼ばれること
 * ドメイン層の関数に紐づくインフラ層の関数に渡されるパラメータが正しいこと
 *
 * 【担保できていないこと】
 * リクエストされたパスに紐づくドメイン層の関数が呼ばれること
 */

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
    const expectedItem: Bear[] = [
      { id: uuidv4(), name: 'ヒグマ', info: 'ヒトはヒグマに勝てねえ' },
      { id: uuidv4(), name: 'シロクマ', info: '白いクマです' },
    ];
    const getAllBearsMock = (infra.getAllBears as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server).get('/bears');
    expect(getAllBearsMock.mock.calls.length).toBe(1);
    expect(getAllBearsMock.mock.calls[0][0]).toBeUndefined();
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });

  test('IDに対応するクマ情報の取得ができること', async () => {
    const inputId: string = uuidv4();
    const expectedItem: Bear = {
      id: inputId,
      name: 'ヒグマ',
      info: 'ヒトはヒグマに勝てねえ',
    };
    const getBearMock = (infra.getBear as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server).get(
      `/bears/${inputId}`
    );
    expect(getBearMock.mock.calls.length).toBe(1);
    expect(getBearMock.mock.calls[0][0]).toEqual(inputId);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });

  test('クマ情報の作成ができること', async () => {
    const inputItem: Bear = {
      name: 'ヒグマ',
      info: 'ヒトはヒグマに勝てねえ',
    };
    const expectedItem: Bear = {
      id: uuidv4(),
      ...inputItem,
    };
    const createBearMock = (infra.createBear as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .post(`/bears`)
      .send(inputItem);
    expect(createBearMock.mock.calls.length).toBe(1);
    expect(createBearMock.mock.calls[0][0]).toEqual(inputItem);
    expect(res.status).toEqual(201);
    expect(res.body).toEqual(expectedItem);
  });

  test('IDに対応するクマ情報の更新ができること', async () => {
    const inputId = uuidv4();
    const inputItem: Bear = {
      name: 'ヒグマ',
      info: 'なっちまえばいいじゃん。羆に',
    };
    const expectedItem: Bear = {
      ...inputItem,
      id: inputId,
    };
    const updateBearsMock = (infra.updateBear as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server)
      .put(`/bears/${inputId}`)
      .send(inputItem);
    expect(updateBearsMock.mock.calls.length).toBe(1);
    expect(updateBearsMock.mock.calls[0][0]).toEqual(inputId);
    expect(updateBearsMock.mock.calls[0][1]).toEqual(inputItem);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });

  test('IDに対応するクマ情報の削除ができること', async () => {
    const inputId = uuidv4();
    const expectedItem: Bear = {
      id: inputId,
      name: 'シロクマ',
      info: '白いクマです',
    };
    const deleteBearsMock = (infra.deleteBear as jest.Mock).mockResolvedValue(
      expectedItem
    );
    const res: request.Response = await request(server).delete(
      `/bears/${inputId}`
    );
    expect(deleteBearsMock.mock.calls.length).toBe(1);
    expect(deleteBearsMock.mock.calls[0][0]).toEqual(inputId);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expectedItem);
  });
});
