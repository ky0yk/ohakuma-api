import { body, check } from 'express-validator';

export const createBearValidator = [
  check('name').isString().trim().notEmpty(),
  body('id').not().exists(),
  body('imageUrl').if(body('imageUrl').exists()).isURL(),
];

export const updateBearValidator = [
  body('id').not().exists(),
  body('name').if(body('name').exists()).notEmpty().isString(),
  body('imageUrl').if(body('imageUrl').exists()).isURL(),
];
