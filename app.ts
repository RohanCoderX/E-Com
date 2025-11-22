#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECommerceStack } from './lib/ecommerce-stack';
import { PipelineStack } from './lib/pipeline-stack';

const app = new cdk.App();

// Main application stack
new ECommerceStack(app, 'ECommerceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-west-2',
  },
});

// CI/CD Pipeline stack
new PipelineStack(app, 'ECommercePipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-west-2',
  },
});