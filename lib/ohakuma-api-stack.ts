import * as cdk from '@aws-cdk/core';
import {
  LambdaRestApi,
  ApiKeySourceType,
  LambdaIntegration,
} from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { ResourceName } from './resourceName';

// TODO 別の方法を検討
require('dotenv').config();

export class OhakumaApiStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    resourceName: ResourceName,
    props?: cdk.StackProps
  ) {
    const id = resourceName.stackName('App');
    super(scope, id, props);

    // DynamoDB
    const bearTableName = resourceName.dynamodbName('bear');
    const bearTable = new dynamodb.Table(this, bearTableName, {
      tableName: bearTableName,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    // Lambda
    const manageBearLambdaName = resourceName.lambdaName('manage-bear');
    const manageBearLambda = new NodejsFunction(this, manageBearLambdaName, {
      functionName: manageBearLambdaName,
      entry: 'src/api/handlers/api-gw/index.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: bearTableName,
      },
    });

    bearTable.grantReadWriteData(manageBearLambda);

    // API Gateway
    const manageBearApiName = resourceName.apiName('manage-bear');
    const manageBearApi = new LambdaRestApi(this, manageBearApiName, {
      restApiName: manageBearApiName,
      handler: manageBearLambda,
      apiKeySourceType: ApiKeySourceType.HEADER,
      proxy: false,
      deployOptions: {
        stageName: 'v1',
      },
    });
    manageBearApi.root.addMethod(
      'ANY',
      new LambdaIntegration(manageBearLambda),
      { apiKeyRequired: true }
    );

    // APIキーの発行とAPI Gatewayへの紐付け
    const createApiKey = (apigw: LambdaRestApi, keyUserName: string) => {
      const apiKeyName = resourceName.apiKeyName(keyUserName);
      const apiKey = apigw.addApiKey(apiKeyName, { apiKeyName: apiKeyName });
      const usagePlan = apigw.addUsagePlan(keyUserName, { name: keyUserName });
      usagePlan.addApiKey(apiKey);
      usagePlan.addApiStage({ stage: apigw.deploymentStage });
    };
    createApiKey(manageBearApi, 'bot');
    createApiKey(manageBearApi, 'member');
    // TODO APIキーの受け渡し方法の検討

    // slack bot Lambda
    const slackBotLambdaName = resourceName.lambdaName('slack-bot');
    const slackBotLambda = new NodejsFunction(this, slackBotLambdaName, {
      functionName: slackBotLambdaName,
      entry: 'src/bot/index.ts',
      handler: 'handler',
      environment: {
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
        SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET || '',
      },
    });

    // slack bot API Gateway
    const slackBotApiName = resourceName.apiName('slack-bot');
    const slackBotApi = new LambdaRestApi(this, slackBotApiName, {
      restApiName: slackBotApiName,
      handler: slackBotLambda,
      deployOptions: {
        stageName: 'v1',
      },
    });
  }
}
