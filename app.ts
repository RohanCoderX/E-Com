#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECommerceStack } from './lib/ecommerce-stack';
import { PipelineStack } from './lib/pipeline-stack';

const app = new cdk.App();

// Main application stack
new ECommerceStack(app, 'ECommerceStack', {
  env: {
    account: '503767747826',
    region: 'us-west-2',
  },
});

// CI/CD Pipeline stack
new PipelineStack(app, 'ECommercePipelineStack', {
  env: {
    account: '503767747826',
    region: 'us-west-2',
  },
});