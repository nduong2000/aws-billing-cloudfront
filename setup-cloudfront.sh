#!/bin/bash

# CloudFront Setup Script for existing S3 bucket
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET_NAME="medical-billing-frontend-202505251250"
AWS_REGION="us-east-1"
S3_WEBSITE_DOMAIN="$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

echo -e "${GREEN}🌐 Setting up CloudFront for: $S3_BUCKET_NAME${NC}"
echo "================================================"

echo -e "${YELLOW}🔧 Creating CloudFront distribution...${NC}"

cat > cloudfront-config.json << EOF
{
    "CallerReference": "medical-billing-$(date +%s)",
    "Comment": "Medical Billing Frontend Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-Website-$S3_BUCKET_NAME",
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
                "Id": "S3-Website-$S3_BUCKET_NAME",
                "DomainName": "$S3_WEBSITE_DOMAIN",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
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

echo -e "${GREEN}🎉 CloudFront setup completed!${NC}"
echo "=================================="
echo -e "${GREEN}📱 Your HTTPS application will be available at:${NC}"
echo -e "${GREEN}   https://$CLOUDFRONT_DOMAIN${NC}"
echo -e "${GREEN}🌐 CloudFront Distribution ID: $CLOUDFRONT_DISTRIBUTION_ID${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Wait 15-20 minutes for CloudFront to deploy"
echo "   2. Update your Lambda backend CORS to allow: https://$CLOUDFRONT_DOMAIN"
echo "   3. Test your application at the HTTPS URL"
echo ""
echo -e "${YELLOW}📝 For future updates:${NC}"
echo "   aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths '/*'" 