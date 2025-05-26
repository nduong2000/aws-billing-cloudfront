#!/bin/bash

# Comprehensive fix for deployment issues
BUCKET_NAME="medical-billing-frontend-20250525"
DISTRIBUTION_ID="EZWL4L4PFCCLN"

echo "🔧 Fixing deployment issues..."

# 1. Fix S3 bucket policy for public read access
echo "📦 Updating S3 bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
echo "✅ S3 bucket policy updated"

# 2. Ensure bucket is configured for website hosting
echo "🌐 Configuring S3 website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
echo "✅ S3 website hosting configured"

# 3. Re-upload index.html with no-cache headers
echo "📄 Re-uploading index.html with no-cache headers..."
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate" \
  --content-type "text/html"
echo "✅ index.html re-uploaded"

# 4. Create multiple aggressive CloudFront invalidations
echo "🔄 Creating aggressive CloudFront invalidations..."

# Invalidation 1: Everything
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

# Invalidation 2: Specific files
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/index.html" "/assets/index-*.js" "/assets/index-*.css" \
  --query 'Invalidation.Id' \
  --output text

# Invalidation 3: All assets
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/assets/*" \
  --query 'Invalidation.Id' \
  --output text

echo "✅ Multiple invalidations created"

# 5. Test S3 website directly
echo "🧪 Testing S3 website..."
S3_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com)
if [ "$S3_RESPONSE" = "200" ]; then
    echo "✅ S3 website is accessible"
else
    echo "❌ S3 website returned HTTP $S3_RESPONSE"
fi

echo ""
echo "🎉 Fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Wait 3-5 minutes for CloudFront invalidation"
echo "2. Test: https://d1zvnblomkhxix.cloudfront.net"
echo "3. Use hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "4. Try incognito/private mode if needed"
echo ""
echo "🔗 Alternative direct S3 URL (if CloudFront still has issues):"
echo "   http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"

# Cleanup
rm -f bucket-policy.json 