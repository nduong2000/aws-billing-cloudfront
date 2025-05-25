#!/bin/bash

# CloudFront Cache Invalidation Script
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Finding CloudFront distribution...${NC}"

# Get all distributions and find the one with our domain
DISTRIBUTIONS=$(aws cloudfront list-distributions --output json)
DISTRIBUTION_ID=$(echo $DISTRIBUTIONS | jq -r '.DistributionList.Items[] | select(.DomainName=="d1zvnblomkhxix.cloudfront.net") | .Id')

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "Could not find distribution. Trying to find by comment..."
    DISTRIBUTION_ID=$(echo $DISTRIBUTIONS | jq -r '.DistributionList.Items[] | select(.Comment=="Medical Billing Frontend Distribution") | .Id')
fi

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "Could not find distribution automatically. Please run manually:"
    echo "aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths '/*'"
    exit 1
fi

echo -e "${YELLOW}🔄 Invalidating cache for distribution: $DISTRIBUTION_ID${NC}"
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo -e "${GREEN}✅ Cache invalidation started!${NC}"
echo "It may take a few minutes for the invalidation to complete." 