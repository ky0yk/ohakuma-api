import express = require('express');
import { body, checkSchema } from 'express-validator';
const router: express.Router = express.Router();
const { check, validationResult } = require('express-validator');
router.use(express.json());

import { v4 as uuidv4 } from 'uuid';

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

router.post(
  '/bears',
  [check('name').isString().trim().notEmpty()],
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    //　バリデーション
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    // UUIDの付与
    const item = req.body;
    item.id = uuidv4();

    // DynamoDBへの登録
    const params = {
      TableName: tableName,
      Item: item,
    };
    try {
      const result = await docClient.put(params).promise();
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

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

router.put(
  '/bears/:id',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    //　TODO バリデーション
    // クエリの組み立て
    const updateExpression = Object.keys(req.body).map(
      (key) => `#att_${key} =:${key}`
    );

    const expressionAttributeNames = Object.fromEntries(
      Object.entries(req.body).map(([k, v]) => [`#att_${k}`, k])
    );

    const expressionAttributeValues = Object.fromEntries(
      Object.entries(req.body).map(([k, v]) => [`:${k}`, v])
    );

    const params = {
      TableName: tableName,
      Key: {
        id: req.params.id,
      },
      UpdateExpression: `set ${updateExpression.join()}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    try {
      // console.log(params);
      const result = await docClient.update(params).promise();
      res.status(200).json(result.Attributes);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/bears/:id',
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const params = {
      TableName: tableName,
      Key: {
        id: req.params.id,
      },
      ReturnValues: 'ALL_OLD',
    };

    try {
      const result = await docClient.delete(params).promise();
      Object.keys(result).length === 0
        ? res.status(404).json('Sorry cant find that!')
        : res.status(200).json(result.Attributes);
    } catch (err) {
      next(err);
    }
  }
);

router.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(err.statusCode).json(err.message);
  }
);

module.exports = router;
