#!/usr/bin/env node
/** CDK app entry point — reads stage from context and instantiates all stacks. */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WeatherStack } from '../lib/stacks/weather-stack';

const app = new cdk.App();

const stage = (app.node.tryGetContext('stage') as string | undefined) ?? 'dev';

const env = {
  account: process.env['CDK_DEFAULT_ACCOUNT'],
  region: process.env['CDK_DEFAULT_REGION'] ?? 'ap-southeast-2',
};

new WeatherStack(app, `AgriSense-${stage}-Weather`, { env, stage });
