import express = require('express');
const app: express.Express = express();

const router: express.Router = require('./router');

app.use('/', router);

module.exports = app;
