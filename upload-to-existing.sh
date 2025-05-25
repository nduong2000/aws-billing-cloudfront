#!/bin/bash

# Upload to existing bucket script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Use the existing bucket
S3_BUCKET_NAME="medical-billing-frontend-20250525"
AWS_REGION="us-east-1"

echo -e "${GREEN}🏥 Uploading to existing bucket: $S3_BUCKET_NAME${NC}"
echo "================================================"

echo -e "${YELLOW}🏗️  Building the application...${NC}"
npm run build

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

echo -e "${GREEN}🎉 Upload completed successfully!${NC}"
echo "=================================="
echo -e "${GREEN}📱 Your application is available at:${NC}"
echo -e "${GREEN}   $WEBSITE_URL${NC}"
echo -e "${GREEN}🪣 S3 Bucket: $S3_BUCKET_NAME${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Test your application at the URL above"
echo "   2. Update your API backend to allow CORS from: $WEBSITE_URL"
echo "   3. For production, consider setting up CloudFront for HTTPS" 