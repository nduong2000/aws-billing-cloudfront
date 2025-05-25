# Deployment Guide to AWS CloudFront

This guide will walk you through deploying the Medical Billing Frontend to AWS CloudFront.

## Prerequisites

1. **AWS CLI installed and configured**
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Configure AWS CLI
   aws configure
   ```

2. **Node.js and npm installed**
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

3. **AWS Account with appropriate permissions**
   - S3 bucket creation and management
   - CloudFront distribution creation and management
   - IAM permissions for deployment

## API Configuration

The application is configured to use:
- **Development**: `http://127.0.0.1:5001/api`
- **Production**: `https://phslqkfk47zphdmvbufwi3oiz40ugscg.lambda-url.us-east-1.on.aws/api`

This is automatically handled in `src/services/api.js` based on the build environment.

## Step-by-Step Deployment

### Step 1: Prepare the Application

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd aws-billing-cloudfront

# Install dependencies
npm install

# Test the build locally
npm run build
npm run preview
```

### Step 2: Configure AWS Credentials

```bash
# Verify AWS configuration
aws sts get-caller-identity

# Should return your AWS account details
```

### Step 3: Deploy Using the Automated Script

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

The script will:
1. Install dependencies
2. Build the React application
3. Create an S3 bucket (with timestamp)
4. Upload files to S3
5. Create a CloudFront distribution
6. Configure caching and error handling
7. Return the CloudFront URL

### Step 4: Manual Deployment (Alternative)

If you prefer manual deployment:

#### Create S3 Bucket
```bash
# Create a unique bucket name
BUCKET_NAME="medical-billing-frontend-$(date +%Y%m%d%H%M)"
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Configure for static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html
```

#### Upload Files
```bash
# Build the application
npm run build

# Upload to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete
```

#### Create CloudFront Distribution
```bash
# Create distribution configuration
cat > cloudfront-config.json << EOF
{
    "CallerReference": "medical-billing-$(date +%s)",
    "Comment": "Medical Billing Frontend Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
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
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
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

# Create the distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Post-Deployment Steps

### 1. Update CORS on Backend

Ensure your Lambda backend allows CORS from the CloudFront domain:

```python
# In your Lambda function
headers = {
    'Access-Control-Allow-Origin': 'https://your-cloudfront-domain.cloudfront.net',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}
```

### 2. Test the Deployment

1. Visit the CloudFront URL
2. Test all functionality:
   - Patient management
   - Claims processing
   - Audit functionality
3. Check browser console for any CORS errors

### 3. Set Up Custom Domain (Optional)

```bash
# Create a Route 53 hosted zone
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Create SSL certificate
aws acm request-certificate --domain-name yourdomain.com --validation-method DNS

# Update CloudFront distribution with custom domain
```

## Updating the Application

For future updates:

```bash
# Build new version
npm run build

# Upload to S3
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend Lambda allows the CloudFront domain
   - Check that API endpoints are correctly configured

2. **404 Errors on Refresh**
   - Verify CloudFront custom error responses are configured
   - Ensure index.html is returned for 404/403 errors

3. **API Connection Issues**
   - Verify the Lambda URL is accessible
   - Check that the API is returning the expected response format

### Debug Mode

Enable debug logging by setting `VITE_DEBUG=true` in your environment or by modifying the DEBUG constant in `src/services/api.js`.

## Security Considerations

1. **HTTPS Only**: CloudFront enforces HTTPS
2. **CORS**: Properly configured for the CloudFront domain
3. **API Security**: Lambda URL should validate requests
4. **Environment Variables**: No sensitive data in frontend code

## Cost Optimization

1. **CloudFront Caching**: Configured for optimal caching
2. **S3 Storage Class**: Use Standard for frequently accessed files
3. **CloudFront Price Class**: Currently set to PriceClass_100 (US, Canada, Europe)

---

**Your Medical Billing Frontend is now deployed to AWS CloudFront! 🎉** 