import { App, AwsLambdaReceiver } from '@slack/bolt';
require('dotenv').config();

const isLocal: boolean = process.env.IS_LOCAL === 'true';
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET ?? '',
});

// ローカルフラグでコンフィグを変更
const config = {
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: isLocal ? process.env.SLACK_SIGNING_SECRET : undefined,
  receiver: isLocal ? undefined : awsLambdaReceiver,
  processBeforeResponse: isLocal ? undefined : true,
};

const app = new App(config);

// メッセージに"hello"が含まれていたら実行する処理
app.message('hello', async ({ message, say }) => {
  await say({
    text: `Hey!`,
  });
});

// ローカル起動用
if (isLocal) {
  (async () => {
    const port = Number(process.env.PORT) || 3030;
    await app.start(port);
    console.log(`app is running at PORT ${port}!`);
  })();
}

module.exports.handler = awsLambdaReceiver.toHandler();
