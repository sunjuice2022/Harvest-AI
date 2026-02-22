/** Reusable DynamoDB construct — Table with pay-per-request billing and point-in-time recovery. */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface HarvestTableProps {
  tableName: string;
  partitionKey: dynamodb.Attribute;
  sortKey?: dynamodb.Attribute;
  /** Defaults to RETAIN for safety. Use DESTROY only in dev. */
  removalPolicy?: cdk.RemovalPolicy;
}

export class HarvestTable extends Construct {
  readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HarvestTableProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      ...(props.sortKey !== undefined ? { sortKey: props.sortKey } : {}),
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.removalPolicy ?? cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });
  }
}
