#!/usr/bin/env node
/** CDK app entry point — reads stage from context and instantiates all stacks. */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/stacks/api-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';

const app = new cdk.App();

const stage = (app.node.tryGetContext('stage') as string | undefined) ?? 'dev';

const env: cdk.Environment = {
  ...(process.env['CDK_DEFAULT_ACCOUNT'] ? { account: process.env['CDK_DEFAULT_ACCOUNT'] } : {}),
  region: process.env['CDK_DEFAULT_REGION'] ?? 'ap-southeast-2',
};

// Single API stack — all features on one API Gateway URL
new ApiStack(app, `HarvestAI-${stage}-Api`, { env, stage });
new FrontendStack(app, `HarvestAI-${stage}-Frontend`, { env, stage });
