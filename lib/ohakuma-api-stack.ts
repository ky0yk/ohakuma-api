import * as cdk from '@aws-cdk/core';
import {
  LambdaRestApi,
  ApiKeySourceType,
  LambdaIntegration,
} from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { ResourceName } from './resourceName';

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

    // API Gateway
    const manageBearApiName = resourceName.apiName('manage-bear');
    const manageBearApi = new LambdaRestApi(this, manageBearApiName, {
      restApiName: manageBearApiName,
      handler: manageBearLambda,
      apiKeySourceType: ApiKeySourceType.HEADER,
      proxy: false,
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
  }
}
