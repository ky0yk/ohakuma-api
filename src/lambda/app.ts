import { Express, Router } from 'express';
import express = require('express');
const app: Express = express();
app.disable('x-powered-by');

const router: Router = require('./router');

app.use('/', router);

module.exports = app;
