import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export class OhakumaApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const appLambda = new NodejsFunction(this, 'appLambda', {
      entry: 'src/lambda/handler/index.ts',
      handler: 'handler',
    });

    new apigw.LambdaRestApi(this, 'ohakumaApi', {
      handler: appLambda,
    });

    const table = new dynamodb.Table(this, 'ohakumaTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    table.grantReadWriteData(appLambda);
  }
}
