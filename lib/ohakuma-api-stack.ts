import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { ResourceName } from './resourceName';
import * as logs from '@aws-cdk/aws-logs';

export class OhakumaApiStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    resourceName: ResourceName,
    props?: cdk.StackProps
  ) {
    const id = resourceName.stackName('Api');
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
      entry: 'src/lambda/handlers/api-gw/index.ts',
      handler: 'handler',
      environment: {
        TABLE_NAME: bearTableName,
      },
    });

    bearTable.grantReadWriteData(manageBearLambda);

    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      'RestApiLogAccessLogGroup',
      {
        logGroupName: `/aws/apigateway/rest-api-access-log`,
        retention: 365,
      }
    );
    // API Gateway
    const manageBearApiName = resourceName.apiName('manage-bear');
    const manageBearApi = new apigw.LambdaRestApi(this, manageBearApiName, {
      restApiName: manageBearApiName,
      handler: manageBearLambda,
      apiKeySourceType: apigw.ApiKeySourceType.HEADER,
      proxy: false,
      deployOptions: {
        stageName: 'v1',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        //アクセスログの設定
        accessLogDestination: new apigw.LogGroupLogDestination(
          restApiLogAccessLogGroup
        ),
        accessLogFormat: apigw.AccessLogFormat.clf(),
      },
    });
    manageBearApi.root.addMethod(
      'ANY',
      new apigw.LambdaIntegration(manageBearLambda),
      { apiKeyRequired: true }
    );
    const anyProxy = manageBearApi.root.addResource('{proxy+}');
    anyProxy.addMethod(`ANY`, new apigw.LambdaIntegration(manageBearLambda), {
      apiKeyRequired: true,
    });

    // APIキーの発行とAPI Gatewayへの紐付け
    const createApiKey = (api: apigw.LambdaRestApi, keyUserName: string) => {
      const apiKeyName = resourceName.apiKeyName(keyUserName);
      const apiKey = api.addApiKey(apiKeyName, { apiKeyName: apiKeyName });
      const usagePlan = api.addUsagePlan(keyUserName, { name: keyUserName });
      usagePlan.addApiKey(apiKey);
      usagePlan.addApiStage({ stage: api.deploymentStage });
    };
    createApiKey(manageBearApi, 'bot');
    createApiKey(manageBearApi, 'member');
  }
}
