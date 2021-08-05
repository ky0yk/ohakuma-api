import express = require('express');
import { Router, Request, Response, NextFunction } from 'express';
import { body, check, Result, validationResult } from 'express-validator';
import * as ddb from './lib/database';

const router: Router = express.Router();
router.use(express.json());

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is working!' });
});

router.get(
  '/bears',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ddb.getAllBears();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/bears/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ddb.getBear(req.params.id);
      result ? res.json(result) : res.status(404).json('Sorry cant find that!');
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
      return;
    }
    try {
      const result = await ddb.createBear(req.body);
      res.status(201).json(result);
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
    try {
      const result = await ddb.updateBear(req.params.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// router.delete(
//   '/bears/:id',
//   async (req: Request, res: Response, next: NextFunction) => {
//     const params: ddbLib.DeleteCommandInput = {
//       TableName: tableName,
//       Key: {
//         id: req.params.id,
//       },
//       ReturnValues: 'ALL_OLD',
//     };
//     try {
//       const result: ddbLib.DeleteCommandOutput = await ddbDocClient.send(
//         new ddbLib.DeleteCommand(params)
//       );
//       result.Attributes
//         ? res.status(200).json(result.Attributes)
//         : res.status(404).json('Sorry cant find that!');
//     } catch (err) {
//       next(err);
//     }
//   }
// );

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json('Internal Server Error');
});

module.exports = router;
