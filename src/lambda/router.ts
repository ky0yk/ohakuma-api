import express = require('express');
const router: express.Router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Hello World!' });
});
router.get('/users', (req: express.Request, res: express.Response) => {
  res.json([{ name: 'Taro' }, { name: 'Hanako' }]);
});

module.exports = router;
