#!/usr/bin/env node
/** CDK app entry point — reads stage from context and instantiates all stacks. */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WeatherStack } from '../lib/stacks/weather-stack';
import { DiagnosisStack } from '../lib/stacks/diagnosis-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';

const app = new cdk.App();

const stage = (app.node.tryGetContext('stage') as string | undefined) ?? 'dev';

const env: cdk.Environment = {
  ...(process.env['CDK_DEFAULT_ACCOUNT'] ? { account: process.env['CDK_DEFAULT_ACCOUNT'] } : {}),
  region: process.env['CDK_DEFAULT_REGION'] ?? 'ap-southeast-2',
};

new WeatherStack(app, `HarvestAI-${stage}-Weather`, { env, stage });
new DiagnosisStack(app, `HarvestAI-${stage}-Diagnosis`, { env });
new FrontendStack(app, `HarvestAI-${stage}-Frontend`, { env, stage });

// TODO: Add News, Community, and Auth stacks
