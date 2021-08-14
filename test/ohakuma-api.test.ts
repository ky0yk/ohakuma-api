import {
  expect as expectCDK,
  countResources,
  haveResource,
} from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as OhakumaApi from '../lib/ohakuma-api-stack';
import { ResourceName } from '../lib/resourceName';

const systemEnv = process.env.SYSTEM_ENV ? process.env.SYSTEM_ENV : 'dev';
const resourceName = new ResourceName('Ohakuma', systemEnv);

const app = new cdk.App();
const stack = new OhakumaApi.OhakumaApiStack(app, resourceName);

test('Lambda', () => {
  expectCDK(stack).to(countResources('AWS::Lambda::Function', 1));
});

test('API Gateway', () => {
  expectCDK(stack).to(countResources('AWS::ApiGateway::RestApi', 1));
});

test('DynamoDB', () => {
  expectCDK(stack).to(countResources('AWS::DynamoDB::Table', 1));
  expectCDK(stack).to(
    haveResource('AWS::DynamoDB::Table', {
      TableName: resourceName.dynamodbName('bear'),
    })
  );
});
