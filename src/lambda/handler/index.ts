const serverlessExpress = require('@vendia/serverless-express');
const app = require('../app');

exports.handler = serverlessExpress({ app });

if (process.env.IS_LOCAL === 'true') {
  (async () => {
    // Start your app
    await app.listen(process.env.PORT || 3000);

    console.log('app is running!');
  })();
}
