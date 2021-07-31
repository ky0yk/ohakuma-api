import express = require('express');
const router: express.Router = express.Router();

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-1',
});

const tableName: string = process.env.TABLE_NAME ? process.env.TABLE_NAME : '';
if (!tableName) {
  new Error('テーブル名を取得できませんでした。'); //TODO チェックが効いてないのを直す
}

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'API is working!' });
});

router.get('/bears', async (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('getBears');
  const params = {
    TableName: tableName,
  };
  console.log(params);
  const result = await docClient.scan(params).promise();

  res.send(result.Items);
});

router.post('/bears', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('postBears');
  res.json({ name: 'Taro' });
});

router.get('/bears/:id', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('getBears/id');
  res.json({ name: req.params.id });
});

router.put('/bears/:id', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('putBears/id');
  res.json({ name: req.params.id });
});

router.delete('/bears/:id', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('deleteBears/id');
  res.json({ name: req.params.id });
});

module.exports = router;
