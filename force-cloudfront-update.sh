#!/bin/bash

# Force CloudFront to serve latest files
DISTRIBUTION_ID="EZWL4L4PFCCLN"

echo "🔄 Forcing CloudFront cache update..."

# Create multiple invalidations to ensure all edge locations update
echo "Creating invalidation 1: All files"
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo "Creating invalidation 2: Specific assets"
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/index.html" "/assets/*" \
  --query 'Invalidation.Id' \
  --output text

echo "Creating invalidation 3: JavaScript files"
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/assets/*.js" "/assets/*.css" \
  --query 'Invalidation.Id' \
  --output text

echo "✅ Multiple invalidations created!"
echo "⏳ Please wait 2-5 minutes for changes to propagate globally"
echo "🌐 Then test: https://d1zvnblomkhxix.cloudfront.net"
echo ""
echo "💡 If still not working, try:"
echo "   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)"
echo "   - Open in incognito/private mode"
echo "   - Clear browser cache" 