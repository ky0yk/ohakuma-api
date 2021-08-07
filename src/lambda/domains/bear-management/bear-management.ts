import { Request, Response, NextFunction } from 'express';
import * as ddb from '../../infrastructures/dynamodb/dynamodb-bear-management-table';
import { validationResult } from 'express-validator';

export const healthCheck = (req: Request, res: Response): void => {
  res.json({ message: 'API is working!' });
};

export const getBears = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result: Bear[] = await ddb.getAllBears();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBear = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result: Bear = await ddb.getBear(req.params.id);
    console.log(result);
    result ? res.json(result) : res.status(404).json('Sorry cant find that!');
  } catch (err) {
    next(err);
  }
};

export const createBear = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  //　バリデーション
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const result: Bear = await ddb.createBear(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateBear = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  //　バリデーション
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const result: Bear = await ddb.updateBear(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteBear = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result: Bear = await ddb.deleteBear(req.params.id);
    result
      ? res.status(200).json(result)
      : res.status(404).json('Sorry cant find that!');
  } catch (err) {
    next(err);
  }
};

export type Bear = {
  name: string;
  info?: string;
  imageUrl?: string;
  [attr: string]: any;
};
