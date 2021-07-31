import express = require('express');
const router: express.Router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'API is working!' });
});

router.get('/bears', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('getBears');
  res.json([{ name: 'Taro' }, { name: 'Hanako' }]);
});

router.post('/bears', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('postBears');
  res.json({ name: 'Taro' });
});

router.get('/bears/:id', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('getBears/id');
  res.json({ name: req.params.id });
});

router.put('/bears/:id', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('putBears/id');
  res.json({ name: req.params.id });
});

router.delete('/bears/:id', (req: express.Request, res: express.Response) => {
  // TODO 実装
  console.log('deleteBears/id');
  res.json({ name: req.params.id });
});

module.exports = router;
