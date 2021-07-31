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

router.get(
  '/bears/:id',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const bearId: string = req.params.id;
    const params = {
      TableName: tableName,
      Key: { id: bearId },
    };
    try {
      const result = await docClient.get(params).promise();
      if (Object.keys(result).length === 0) {
        res.status(404).json('Sorry cant find that!');
      }
      res.json(result.Item);
    } catch (err) {
      next(err);
    }
  }
);

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
    res.status(500).json('Internal Server Error');
  }
);

module.exports = router;
