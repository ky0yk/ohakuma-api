import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
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
    const apiName = resourceName.apiName('manage-bear');
    new apigw.LambdaRestApi(this, apiName, {
      restApiName: apiName,
      handler: manageBearLambda,
    });
  }
}
