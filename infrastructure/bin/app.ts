/**
 * Root CDK App - entry point for infrastructure
 */

import * as cdk from "aws-cdk-lib";
import { WeatherStack } from "../lib/stacks/weather-stack";
import { DiagnosisStack } from "../lib/stacks/diagnosis-stack";

const app = new cdk.App();

// Define stacks for each domain
const env: cdk.Environment = {
  ...(process.env.CDK_DEFAULT_ACCOUNT && {
    account: process.env.CDK_DEFAULT_ACCOUNT,
  }),
  region: process.env.CDK_DEFAULT_REGION || "ap-southeast-2",
};

new WeatherStack(app, "WeatherStack", { env });

new DiagnosisStack(app, "DiagnosisStack", { env });

// TODO: Add News, Community, and Auth stacks
