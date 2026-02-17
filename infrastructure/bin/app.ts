/**
 * Root CDK App - entry point for infrastructure
 */

import * as cdk from "aws-cdk-lib";
import { WeatherStack } from "../lib/stacks/weather-stack";
import { DiagnosisStack } from "../lib/stacks/diagnosis-stack";

const app = new cdk.App();

// Define stacks for each domain
new WeatherStack(app, "WeatherStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});

new DiagnosisStack(app, "DiagnosisStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});

// TODO: Add News, Community, and Auth stacks
