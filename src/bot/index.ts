// import serverlessExpress from '@vendia/serverless-express';
import { App, AwsLambdaReceiver } from '@slack/bolt';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { Server } from 'http';
require('dotenv').config();

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? '',
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  processBeforeResponse: true,
});

module.exports.handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: any
): Promise<void> => {
  const handler: any = await app.start();
  return handler(event, context, callback);
};

// メッセージに"hello"が含まれていたら実行する処理
app.message('hello', async ({ message, say }) => {
  await say({
    text: `Hey!`,
  });
});

// ローカル起動用
if (process.env.IS_LOCAL === 'true') {
  (async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3030);

    console.log('⚡️ Bolt app is running!');
  })();
}
