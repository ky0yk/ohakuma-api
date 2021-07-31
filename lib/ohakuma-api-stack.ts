import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class OhakumaApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tableName = 'ohakumaTable';
    // The code that defines your stack goes here
    const appLambda = new NodejsFunction(this, 'appLambda', {
      entry: 'src/lambda/handler/index.ts',
      handler: 'handler',
      environment: {
        tableName: tableName,
      },
    });

    new apigw.LambdaRestApi(this, 'ohakumaApi', {
      handler: appLambda,
    });

    const table = new dynamodb.Table(this, 'ohakumaTable', {
      tableName: tableName,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    table.grantReadWriteData(appLambda);
  }
}
