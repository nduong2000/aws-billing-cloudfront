#!/bin/bash

# Simple Medical Billing Frontend Deployment Script
# This script uses a simpler approach to deploy to S3 + CloudFront

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET_NAME="medical-billing-frontend-$(date +%Y%m%d%H%M)"
AWS_REGION="us-east-1"

echo -e "${GREEN}🏥 Medical Billing Frontend - Simple Deployment${NC}"
echo "=============================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🏗️  Building the application...${NC}"
npm run build

echo -e "${YELLOW}📦 Creating S3 bucket: $S3_BUCKET_NAME${NC}"
aws s3 mb s3://$S3_BUCKET_NAME --region $AWS_REGION

echo -e "${YELLOW}🔓 Temporarily disabling block public access for this bucket...${NC}"
aws s3api put-public-access-block \
    --bucket $S3_BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo -e "${YELLOW}🌐 Configuring bucket for static website hosting...${NC}"
aws s3 website s3://$S3_BUCKET_NAME --index-document index.html --error-document index.html

echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete

echo -e "${YELLOW}🔐 Setting bucket policy...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $S3_BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Get the website URL
WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================="
echo -e "${GREEN}📱 Your application is available at:${NC}"
echo -e "${GREEN}   $WEBSITE_URL${NC}"
echo -e "${GREEN}🪣 S3 Bucket: $S3_BUCKET_NAME${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Test your application at the URL above"
echo "   2. Update your API backend to allow CORS from: $WEBSITE_URL"
echo "   3. For production, consider setting up CloudFront for HTTPS and better performance"
echo ""
echo -e "${YELLOW}📝 To set up CloudFront later:${NC}"
echo "   1. Create a CloudFront distribution pointing to: $S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo "   2. Configure custom error pages (404 -> /index.html)"
echo "   3. Update CORS to allow the CloudFront domain" 