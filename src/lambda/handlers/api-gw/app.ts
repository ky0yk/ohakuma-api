import { Express, Router } from 'express';
import express = require('express');
const app: Express = express();
app.disable('x-powered-by');

const router: Router = require('../../domains/bear-management/bear-management');

app.use('/', router);

module.exports = app;
