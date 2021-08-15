#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { OhakumaApiStack } from '../lib/ohakuma-api-stack';
import { ResourceName } from '../lib/resourceName';

const systemEnv = process.env.SYSTEM_ENV ? process.env.SYSTEM_ENV : 'dev';
const resourceName = new ResourceName('Ohakuma', systemEnv);

const app = new cdk.App();
new OhakumaApiStack(app, resourceName);
