import express = require('express');
const router: express.Router = express.Router();

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'ap-northeast-1',
});

const tableName: string | undefined = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('テーブル名を取得できませんでした。');
}

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'API is working!' });
});

router.get(
  '/bears',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const params = {
      TableName: tableName,
    };
    try {
      const result = await docClient.scan(params).promise();
      res.json(result.Items);
    } catch (err) {
      next(err);
    }
  }
);

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

router.use(
  (
    err: express.Errback,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
);

module.exports = router;
