import * as http from 'http';
import request = require('supertest');
const app = require('../../src/lambda/handlers//api-gw/app');

describe('ヘルスチェック', () => {
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
});
