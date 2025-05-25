# GitHub Actions Deployment Setup

This guide will help you set up automated deployment of the Medical Billing Frontend to AWS CloudFront using GitHub Actions.

## 🔧 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **AWS Account**: With appropriate permissions for S3 and CloudFront
3. **AWS IAM User**: With programmatic access for GitHub Actions

## 🔑 Step 1: Create AWS IAM User for GitHub Actions

### Create IAM Policy

1. Go to AWS IAM Console → Policies → Create Policy
2. Use JSON editor and paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:PutBucketPolicy",
                "s3:PutBucketWebsite",
                "s3:PutPublicAccessBlock"
            ],
            "Resource": [
                "arn:aws:s3:::medical-billing-frontend-*",
                "arn:aws:s3:::medical-billing-frontend-*/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation",
                "cloudfront:GetDistribution",
                "cloudfront:ListDistributions"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:ListAllMyBuckets"
            ],
            "Resource": "*"
        }
    ]
}
```

3. Name it: `GitHubActions-MedicalBilling-Deploy`

### Create IAM User

1. Go to IAM → Users → Create User
2. Username: `github-actions-medical-billing`
3. Attach the policy you just created
4. Create access keys for programmatic access
5. **Save the Access Key ID and Secret Access Key** (you'll need these for GitHub)

## 🔐 Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key | AWS credentials for deployment |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret key | AWS credentials for deployment |
| `CLOUDFRONT_DISTRIBUTION_ID` | Your CloudFront distribution ID | For cache invalidation (optional) |

### How to find your CloudFront Distribution ID:

```bash
aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Medical Billing Frontend Distribution'].{Id:Id,Domain:DomainName}" --output table
```

## 🚀 Step 3: Deployment Workflows

### Main Production Deployment

**Triggers**: Push to `main` or `master` branch
**File**: `.github/workflows/deploy.yml`
**Deploys to**: Your production S3 bucket and CloudFront

### Staging Deployment

**Triggers**: Push to `develop` or `staging` branch  
**File**: `.github/workflows/deploy-staging.yml`
**Deploys to**: Temporary staging S3 bucket

## 📋 Step 4: Branch Strategy

### Recommended Git Flow:

```
main/master     ← Production deployments
  ↑
develop        ← Staging deployments  
  ↑
feature/*      ← Feature branches
```

### Workflow:

1. **Feature Development**: Create feature branches from `develop`
2. **Staging**: Merge to `develop` → triggers staging deployment
3. **Production**: Merge `develop` to `main` → triggers production deployment

## 🔄 Step 5: First Deployment

### Option A: Push to trigger deployment

```bash
# Make sure you're on main branch
git checkout main

# Make a small change (like updating README)
echo "# Deployed via GitHub Actions" >> README.md

# Commit and push
git add .
git commit -m "feat: setup GitHub Actions deployment"
git push origin main
```

### Option B: Manual workflow trigger

1. Go to GitHub → Actions tab
2. Select "Deploy Medical Billing Frontend to AWS CloudFront"
3. Click "Run workflow"

## 📊 Step 6: Monitor Deployments

### View Deployment Status:

1. Go to your GitHub repository
2. Click on "Actions" tab
3. See all workflow runs and their status

### Deployment URLs:

- **Production**: https://your-cloudfront-domain.cloudfront.net
- **Staging**: http://medical-billing-frontend-staging-{run-number}.s3-website-us-east-1.amazonaws.com

## 🛠️ Customization

### Update S3 Bucket Name

Edit `.github/workflows/deploy.yml`:

```yaml
env:
  S3_BUCKET: your-custom-bucket-name
```

### Add Environment Variables

Add to the workflow file:

```yaml
- name: Build application
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_CUSTOM_VAR: ${{ secrets.VITE_CUSTOM_VAR }}
```

### Add Tests

The workflow includes a test step. Add your test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## 🔍 Troubleshooting

### Common Issues:

1. **AWS Permissions**: Ensure IAM user has all required permissions
2. **Bucket Names**: S3 bucket names must be globally unique
3. **Secrets**: Double-check all GitHub secrets are set correctly
4. **Branch Names**: Ensure you're pushing to the correct branch

### Debug Steps:

1. Check GitHub Actions logs for detailed error messages
2. Verify AWS credentials work locally:
   ```bash
   aws sts get-caller-identity
   ```
3. Test S3 access:
   ```bash
   aws s3 ls s3://your-bucket-name
   ```

## 🎯 Benefits of This Setup

- ✅ **Automated Deployments**: Push code → automatic deployment
- ✅ **Staging Environment**: Test changes before production
- ✅ **Cache Invalidation**: CloudFront cache automatically cleared
- ✅ **Build Optimization**: Proper cache headers for performance
- ✅ **Security**: No AWS credentials stored in code
- ✅ **Rollback**: Easy to revert via Git
- ✅ **Monitoring**: Full deployment history in GitHub

## 🔄 Updating the Application

### For Production:
```bash
git checkout main
# Make your changes
git add .
git commit -m "feat: your feature description"
git push origin main
# Deployment happens automatically!
```

### For Staging:
```bash
git checkout develop
# Make your changes  
git add .
git commit -m "feat: test new feature"
git push origin develop
# Staging deployment happens automatically!
```

---

**Your Medical Billing Frontend now has automated CI/CD! 🎉** 