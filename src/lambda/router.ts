import express = require('express');
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
  UpdateCommand,
  PutCommandOutput,
  GetCommandOutput,
  UpdateCommandOutput,
  DeleteCommandOutput,
  ScanCommandInput,
  ScanCommand,
  ScanCommandOutput,
  PutCommandInput,
  GetCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const router: express.Router = express.Router();
const { check, validationResult } = require('express-validator');
router.use(express.json());

const ddbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

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
    const params: ScanCommandInput = {
      TableName: tableName,
    };
    try {
      const result: ScanCommandOutput = await ddbDocClient.send(
        new ScanCommand(params)
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
    const params: PutCommandInput = {
      TableName: tableName,
      Item: item,
    };
    try {
      const result: PutCommandOutput = await ddbDocClient.send(
        new PutCommand(params)
      );
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
    const params: GetCommandInput = {
      TableName: tableName,
      Key: { id: req.params.id },
    };
    try {
      const result: GetCommandOutput = await ddbDocClient.send(
        new GetCommand(params)
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

    const params: UpdateCommandInput = {
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
      const result: UpdateCommandOutput = await ddbDocClient.send(
        new UpdateCommand(params)
      );
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
    const params: DeleteCommandInput = {
      TableName: tableName,
      Key: {
        id: req.params.id,
      },
      ReturnValues: 'ALL_OLD',
    };

    try {
      const result: DeleteCommandOutput = await ddbDocClient.send(
        new DeleteCommand(params)
      );
      console.log(result);
      result.Attributes
        ? res.status(200).json(result.Attributes)
        : res.status(404).json('Sorry cant find that!');
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
