import express = require('express');
import { Router, Request, Response, NextFunction } from 'express';

import * as ddbLib from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { body } from 'express-validator';

const router: Router = express.Router();
const { check, validationResult } = require('express-validator');
router.use(express.json());

const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
const ddbDocClient = ddbLib.DynamoDBDocumentClient.from(ddbClient);

const tableName: string | undefined = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('テーブル名を取得できませんでした。');
}

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is working!' });
});

router.get(
  '/bears',
  async (req: Request, res: Response, next: NextFunction) => {
    const params: ddbLib.ScanCommandInput = {
      TableName: tableName,
    };
    try {
      const result: ddbLib.ScanCommandOutput = await ddbDocClient.send(
        new ddbLib.ScanCommand(params)
      );
      res.json(result.Items);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/bears',
  [check('name').isString().trim().notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    //　バリデーション
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    // UUIDの付与
    const item = req.body;
    item.id = uuidv4();
    // DynamoDBへの登録
    const params: ddbLib.PutCommandInput = {
      TableName: tableName,
      Item: item,
    };
    try {
      const result: ddbLib.PutCommandOutput = await ddbDocClient.send(
        new ddbLib.PutCommand(params)
      );
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/bears/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const params: ddbLib.GetCommandInput = {
      TableName: tableName,
      Key: { id: req.params.id },
    };
    try {
      const result: ddbLib.GetCommandOutput = await ddbDocClient.send(
        new ddbLib.GetCommand(params)
      );
      result.Item
        ? res.json(result.Item)
        : res.status(404).json('Sorry cant find that!');
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/bears/:id',
  [
    body('id').not().exists(),
    body('name').if(body('name').exists()).notEmpty().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    //　バリデーション
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
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
    // DynamoDBへの登録
    const params: ddbLib.UpdateCommandInput = {
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
      const result: ddbLib.UpdateCommandOutput = await ddbDocClient.send(
        new ddbLib.UpdateCommand(params)
      );
      res.status(200).json(result.Attributes);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/bears/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    const params: ddbLib.DeleteCommandInput = {
      TableName: tableName,
      Key: {
        id: req.params.id,
      },
      ReturnValues: 'ALL_OLD',
    };
    try {
      const result: ddbLib.DeleteCommandOutput = await ddbDocClient.send(
        new ddbLib.DeleteCommand(params)
      );
      result.Attributes
        ? res.status(200).json(result.Attributes)
        : res.status(404).json('Sorry cant find that!');
    } catch (err) {
      next(err);
    }
  }
);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json('Internal Server Error');
});

module.exports = router;
