#!/bin/bash
echo "Building and deploying E-Commerce app..."
npm run build
cdk deploy --require-approval never
echo "Deployment complete!"