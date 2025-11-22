#!/bin/bash

echo "Setting up CI/CD Pipeline for E-Commerce App..."

# Build the project
npm run build

# Deploy the pipeline stack
cdk deploy ECommercePipelineStack --require-approval never

echo "Pipeline deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Update lib/pipeline-stack.ts with your GitHub username and repo name"
echo "2. Create a GitHub personal access token and store it in AWS Secrets Manager as 'github-token'"
echo "3. Push your code to GitHub repository"
echo "4. The pipeline will automatically deploy changes when you push to main branch"