import express = require('express');
import { Express, Request, Response, NextFunction } from 'express';
import * as bm from '../../domains/bear-management/bear-management';
import { createBearValidator, updateBearValidator } from './validators';

const app: Express = express().disable('x-powered-by');
const morgan = require('morgan');

app.use(express.json());
app.use(morgan('combined'));

app.get('/', bm.healthCheck);
app.get('/bears', bm.getBears);
app.get('/bears/:id', bm.getBear);
app.post('/bears', createBearValidator, bm.createBear);
app.put('/bears/:id', updateBearValidator, bm.updateBear);
app.delete('/bears/:id', bm.deleteBear);

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json('Internal Server Error');
});

module.exports = app;
