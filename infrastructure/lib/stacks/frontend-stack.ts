/** Frontend CDK Stack — S3 bucket + CloudFront distribution for the React SPA. */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

// ACM certificate ARN (must be in us-east-1 for CloudFront)
const CERT_ARN = 'arn:aws:acm:us-east-1:567282577973:certificate/48e0f185-1175-4e24-9d3a-f2877473daec';
const DOMAIN_NAMES = ['harvestai.com', 'www.harvestai.com'];

export interface FrontendStackProps extends cdk.StackProps {
  stage: string;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);
    const { stage } = props;

    const bucket = this.createBucket(stage);
    const distribution = this.createDistribution(bucket, stage);
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

    const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', CERT_ARN);

    return new cloudfront.Distribution(this, 'Distribution', {
      comment: `HarvestAI ${stage} frontend`,
      defaultRootObject: 'index.html',
      domainNames: DOMAIN_NAMES,
      certificate,
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
