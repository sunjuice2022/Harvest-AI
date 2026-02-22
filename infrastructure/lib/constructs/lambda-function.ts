/** Reusable Lambda construct — NodejsFunction with esbuild bundling and standard Harvest AI config. */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export interface HarvestLambdaProps {
  stage: string;
  name: string;
  /** Path to the TypeScript entry file, relative to the repo root. */
  entry: string;
  /** Exported handler function name in the entry file. */
  handler: string;
  environment?: Record<string, string>;
  timeout?: cdk.Duration;
  memorySize?: number;
}

export class HarvestLambda extends Construct {
  readonly fn: NodejsFunction;

  constructor(scope: Construct, id: string, props: HarvestLambdaProps) {
    super(scope, id);

    const repoRoot = path.resolve(__dirname, '..', '..', '..');

    this.fn = new NodejsFunction(this, 'Fn', {
      functionName: `HarvestAI-${props.stage}-${props.name}`,
      entry: path.join(repoRoot, props.entry),
      handler: props.handler,
      runtime: Runtime.NODEJS_22_X,
      memorySize: props.memorySize ?? 256,
      timeout: props.timeout ?? cdk.Duration.seconds(30),
      ...(props.environment !== undefined ? { environment: props.environment } : {}),
      bundling: {
        externalModules: ['@aws-sdk/*'],
        sourceMap: props.stage !== 'prod',
        minify: props.stage === 'prod',
      },
    });
  }
}
