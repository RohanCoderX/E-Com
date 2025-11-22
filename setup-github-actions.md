# GitHub Actions CI/CD Setup

## Quick Setup Steps:

1. **Push code to GitHub repository**
2. **Add AWS credentials to GitHub Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

3. **Push to main/master branch** - Pipeline runs automatically!

## Pipeline automatically:
- Installs dependencies
- Builds the project
- Deploys to AWS
- Updates your live website

Your website will auto-update at: http://ecommerce-website-016430248234-us-west-2.s3-website-us-west-2.amazonaws.com