/** Frontend CDK Stack — S3 bucket + CloudFront distribution for the React SPA. */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

// Wildcard ACM certificate (us-east-1, covers *.harvestai.au + harvestai.au)
// Set to undefined to deploy without a custom domain (e.g. while cert is pending)
const CERT_ARN: string | undefined = undefined;

function domainNamesForStage(stage: string): string[] {
  if (stage === 'prod') return ['harvestai.au', 'www.harvestai.au'];
  return [`${stage}.harvestai.au`]; // dev → dev.harvestai.au, staging → staging.harvestai.au
}

export interface FrontendStackProps extends cdk.StackProps {
  stage: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);
    const { stage } = props;

    const bucket = this.createBucket(stage);
    const distribution = this.createDistribution(bucket, stage);
    this.createDnsRecords(distribution, stage);
    this.createOutputs(bucket, distribution);
  }

  private createBucket(stage: string): s3.Bucket {
    return new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `harvest-ai-${stage}-frontend-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: stage === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: stage !== 'prod',
    });
  }

  private createDistribution(bucket: s3.Bucket, stage: string): cloudfront.Distribution {
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      originAccessControlName: `HarvestAI-${stage}-Frontend`,
    });

    const certificate = CERT_ARN
      ? acm.Certificate.fromCertificateArn(this, 'Certificate', CERT_ARN)
      : undefined;

    return new cloudfront.Distribution(this, 'Distribution', {
      comment: `HarvestAI ${stage} frontend`,
      defaultRootObject: 'index.html',
      ...(certificate ? { domainNames: domainNamesForStage(stage), certificate } : {}),
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });
  }

  private createDnsRecords(distribution: cloudfront.Distribution, stage: string): void {
    if (!CERT_ARN) return; // skip DNS alias records until cert is issued
    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: 'harvestai.au' });
    domainNamesForStage(stage).forEach((domain, i) => {
      new route53.ARecord(this, `AliasRecord${i}`, {
        zone,
        recordName: domain,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });
    });
  }

  private createOutputs(bucket: s3.Bucket, distribution: cloudfront.Distribution): void {
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: bucket.bucketName,
      description: 'S3 bucket for frontend assets',
    });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
    });
    new cdk.CfnOutput(this, 'CloudFrontUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL for the frontend',
    });
  }
}
