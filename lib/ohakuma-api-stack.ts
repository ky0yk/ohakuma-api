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

    // API Key
    const manageBearApiKeyName = resourceName.apiKeyName('manage-bear');
    const manageBearApiKey = manageBearApi.addApiKey(manageBearApiKeyName, {
      apiKeyName: manageBearApiKeyName,
    });

    //TODO 名前を直す
    const usagePlan = manageBearApi.addUsagePlan('hoge', { name: 'fuga' });
    usagePlan.addApiKey(manageBearApiKey);
    usagePlan.addApiStage({ stage: manageBearApi.deploymentStage });
  }
}
