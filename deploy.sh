#!/bin/bash

# Medical Billing Frontend - AWS CloudFront Deployment Script
# This script builds the React app and deploys it to S3 + CloudFront

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET_NAME="medical-billing-frontend-$(date +%Y%m%d)"
CLOUDFRONT_DISTRIBUTION_ID=""
AWS_REGION="us-east-1"

echo -e "${GREEN}🏥 Medical Billing Frontend Deployment${NC}"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

# Load environment variables if .env exists
if [ -f .env ]; then
    echo -e "${YELLOW}📄 Loading environment variables from .env${NC}"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Use environment variable if set
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    CLOUDFRONT_DISTRIBUTION_ID="$CLOUDFRONT_DISTRIBUTION_ID"
fi

echo -e "${YELLOW}🔧 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🏗️  Building the application...${NC}"
npm run build

echo -e "${YELLOW}☁️  Checking if S3 bucket exists...${NC}"
if aws s3 ls "s3://$S3_BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}📦 Creating S3 bucket: $S3_BUCKET_NAME${NC}"
    aws s3 mb s3://$S3_BUCKET_NAME --region $AWS_REGION
    
    # Configure bucket for static website hosting (but keep it private)
    aws s3 website s3://$S3_BUCKET_NAME --index-document index.html --error-document index.html
    
    echo -e "${GREEN}✅ S3 bucket created (private - will be accessed via CloudFront)${NC}"
else
    echo -e "${GREEN}✅ S3 bucket $S3_BUCKET_NAME exists${NC}"
fi

echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete --cache-control "max-age=31536000" --exclude "*.html"
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete --cache-control "max-age=0, no-cache, no-store, must-revalidate" --include "*.html"

# Create CloudFront distribution if it doesn't exist
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🌐 Creating CloudFront Origin Access Control...${NC}"
    
    # Create Origin Access Control
    OAC_CONFIG=$(cat << EOF
{
    "Name": "medical-billing-oac-$(date +%s)",
    "Description": "Origin Access Control for Medical Billing Frontend",
    "OriginAccessControlConfig": {
        "Name": "medical-billing-oac-$(date +%s)",
        "Description": "OAC for S3 bucket access",
        "SigningProtocol": "sigv4",
        "SigningBehavior": "always",
        "OriginAccessControlOriginType": "s3"
    }
}
EOF
)
    
    OAC_RESULT=$(aws cloudfront create-origin-access-control --origin-access-control-config "$OAC_CONFIG")
    OAC_ID=$(echo $OAC_RESULT | jq -r '.OriginAccessControl.Id')
    
    echo -e "${YELLOW}🌐 Creating CloudFront distribution...${NC}"
    
    cat > cloudfront-config.json << EOF
{
    "CallerReference": "medical-billing-$(date +%s)",
    "Comment": "Medical Billing Frontend Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$S3_BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true,
        "AllowedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"],
            "CachedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"]
            }
        }
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$S3_BUCKET_NAME",
                "DomainName": "$S3_BUCKET_NAME.s3.$AWS_REGION.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                },
                "OriginAccessControlId": "$OAC_ID"
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
EOF
    
    DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json)
    CLOUDFRONT_DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
    CLOUDFRONT_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')
    
    rm cloudfront-config.json
    
    echo -e "${YELLOW}🔐 Creating S3 bucket policy for CloudFront access...${NC}"
    
    # Create bucket policy that allows CloudFront to access the bucket
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::$(aws sts get-caller-identity --query Account --output text):distribution/$CLOUDFRONT_DISTRIBUTION_ID"
                }
            }
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket $S3_BUCKET_NAME --policy file://bucket-policy.json
    rm bucket-policy.json
    
    echo -e "${GREEN}✅ CloudFront distribution created!${NC}"
    echo -e "${GREEN}   Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID${NC}"
    echo -e "${GREEN}   Domain: $CLOUDFRONT_DOMAIN${NC}"
    echo -e "${YELLOW}   Note: It may take 15-20 minutes for the distribution to be fully deployed.${NC}"
    
    # Update .env file with distribution ID
    if [ -f .env ]; then
        sed -i.bak "s/CLOUDFRONT_DISTRIBUTION_ID=.*/CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID/" .env
    else
        echo "CLOUDFRONT_DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID" >> .env
    fi
    
else
    echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
    
    # Get distribution domain
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID | jq -r '.Distribution.DomainName')
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=================================="
echo -e "${GREEN}📱 Your application is available at:${NC}"
echo -e "${GREEN}   https://$CLOUDFRONT_DOMAIN${NC}"
echo -e "${GREEN}🪣 S3 Bucket: $S3_BUCKET_NAME${NC}"
echo -e "${GREEN}🌐 CloudFront Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Wait 15-20 minutes for CloudFront distribution to deploy"
echo "   2. Update your API backend to allow CORS from: https://$CLOUDFRONT_DOMAIN"
echo "   3. Consider setting up a custom domain with Route 53" 