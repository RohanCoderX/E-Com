# CI/CD Pipeline Setup

## Overview
Automated deployment pipeline for the E-Commerce application using AWS CodePipeline and GitHub Actions.

## Setup Instructions

### 1. GitHub Actions (Recommended)
- Push code to GitHub repository
- Add AWS credentials to GitHub Secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
- Pipeline runs automatically on push to main/master branch

### 2. AWS CodePipeline (Alternative)
1. Update `lib/pipeline-stack.ts`:
   - Replace `YOUR_GITHUB_USERNAME` with your GitHub username
   - Replace `YOUR_REPO_NAME` with your repository name

2. Create GitHub token in AWS Secrets Manager:
   ```bash
   aws secretsmanager create-secret \
     --name github-token \
     --secret-string "your-github-personal-access-token"
   ```

3. Deploy pipeline:
   ```bash
   ./deploy-pipeline.sh
   ```

## Pipeline Features
- Automatic deployment on code changes
- Build and test validation
- CDK deployment to AWS
- Cost-efficient with minimal resources

## Files Created
- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `buildspec.yml` - AWS CodeBuild specification
- `lib/pipeline-stack.ts` - CDK pipeline infrastructure
- `deploy-pipeline.sh` - Pipeline deployment script