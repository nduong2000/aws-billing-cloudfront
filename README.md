# Medical Billing Frontend

A comprehensive React-based frontend application for medical billing management, built with modern web technologies and designed for deployment on AWS CloudFront.

## 🏥 Overview

This application provides a complete medical billing management system with the following features:

- **Patient Management** - Track patient information, insurance details, and medical history
- **Provider Management** - Manage healthcare providers, specialties, and NPI numbers  
- **Services & CPT Codes** - Handle medical services with standardized CPT codes and pricing
- **Appointment Scheduling** - Schedule and track patient appointments with providers
- **Claims Processing** - Submit, track, and manage insurance claims and payments
- **Audit & Compliance** - Audit claims for fraud detection and compliance monitoring

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern design patterns
- **Build Tool**: Vite with optimized production builds
- **Deployment**: AWS S3 + CloudFront CDN

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **AWS CLI** (for deployment)
- **AWS Account** with appropriate permissions

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd aws-billing-cloudfront
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# API Configuration
VITE_API_URL=https://your-api-domain.com/api

# AWS Configuration (for deployment)
AWS_REGION=us-east-1
AWS_PROFILE=default

# CloudFront Distribution ID (set after creating distribution)
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id

# Environment
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

This generates optimized static files in the `dist/` directory with:
- Code splitting for better performance
- Minified JavaScript and CSS
- Optimized asset loading

## ☁️ AWS CloudFront Deployment

### Automated Deployment

The easiest way to deploy is using the provided deployment script:

```bash
# Make the script executable (first time only)
chmod +x deploy.sh

# Deploy to AWS
npm run deploy
```

### Manual Deployment Steps

#### 1. Configure AWS CLI

```bash
aws configure
```

Enter your AWS credentials:
- Access Key ID
- Secret Access Key  
- Default region (e.g., us-east-1)
- Output format (json)

#### 2. Create S3 Bucket

```bash
aws s3 mb s3://medical-billing-frontend --region us-east-1
```

#### 3. Configure S3 for Static Website Hosting

```bash
aws s3 website s3://medical-billing-frontend \
  --index-document index.html \
  --error-document index.html
```

#### 4. Set Bucket Policy for Public Access

Create a `bucket-policy.json` file:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::medical-billing-frontend/*"
        }
    ]
}
```

Apply the policy:

```bash
aws s3api put-bucket-policy \
  --bucket medical-billing-frontend \
  --policy file://bucket-policy.json
```

#### 5. Upload Files to S3

```bash
npm run build
aws s3 sync dist/ s3://medical-billing-frontend --delete
```

#### 6. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

The deployment script automatically handles CloudFront configuration.

### 7. Update DNS (Optional)

For a custom domain, configure Route 53 or your DNS provider to point to the CloudFront distribution.

## 📁 Project Structure

```
aws-billing-cloudfront/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   └── Navigation.jsx # Main navigation component
│   ├── pages/            # Page components
│   │   ├── HomePage.jsx  # Landing page
│   │   ├── PatientsPage.jsx
│   │   ├── ProvidersPage.jsx
│   │   ├── ServicesPage.jsx
│   │   ├── AppointmentsPage.jsx
│   │   ├── ClaimsPage.jsx
│   │   └── AuditPage.jsx
│   ├── services/         # API service layer
│   │   └── api.js        # Axios configuration and API calls
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   ├── index.css        # Global styles
│   └── aws-exports.js   # AWS configuration
├── sql/                 # Database schema
│   └── medical_billing_schema.sql
├── deploy.sh           # Automated deployment script
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to AWS CloudFront
- `npm run deploy:build` - Build and upload to S3
- `npm run deploy:invalidate` - Invalidate CloudFront cache

## 🗄️ Database Schema

The application works with a PostgreSQL database. The schema is defined in `sql/medical_billing_schema.sql` and includes:

- **patients** - Patient information and insurance details
- **providers** - Healthcare provider information
- **services** - Medical services with CPT codes
- **appointments** - Patient-provider appointments
- **claims** - Insurance claims and billing
- **payments** - Payment tracking
- **claim_items** - Line items for claims

## 🔗 API Integration

The frontend communicates with a backend API through the `src/services/api.js` service layer. Key features:

- Axios-based HTTP client with interceptors
- Environment-based API URL configuration
- Comprehensive error handling and logging
- RESTful API endpoints for all resources

### API Endpoints

- `GET/POST/PUT/DELETE /patients` - Patient management
- `GET/POST/PUT/DELETE /providers` - Provider management  
- `GET/POST/PUT/DELETE /services` - Service management
- `GET/POST/PUT/DELETE /appointments` - Appointment management
- `GET/POST/PUT/DELETE /claims` - Claims management
- `POST /claims/:id/audit` - Claim auditing

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Modern dark theme with accessibility considerations
- **Navigation** - Intuitive navigation with active state indicators
- **Form Handling** - Comprehensive forms with validation
- **Data Tables** - Sortable and filterable data displays
- **Loading States** - User feedback during API operations

## 🔒 Security Considerations

- **HTTPS Only** - CloudFront enforces HTTPS
- **CORS Configuration** - Proper CORS setup for API communication
- **Environment Variables** - Sensitive data stored in environment variables
- **Input Validation** - Client-side validation with server-side verification
- **Error Handling** - Secure error messages without sensitive data exposure

## 🚀 Performance Optimizations

- **Code Splitting** - Automatic code splitting with Vite
- **Asset Optimization** - Minified CSS/JS and optimized images
- **CDN Delivery** - Global content delivery via CloudFront
- **Caching Strategy** - Optimized cache headers for static assets
- **Bundle Analysis** - Separate vendor and application bundles

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Verify `VITE_API_URL` in `.env` file
   - Check CORS configuration on backend
   - Ensure API server is running and accessible

2. **Build Failures**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Deployment Issues**
   - Verify AWS credentials: `aws sts get-caller-identity`
   - Check S3 bucket permissions
   - Ensure CloudFront distribution is active

4. **CORS Errors**
   - Update backend CORS settings to include CloudFront domain
   - Verify API URL configuration
   - Check browser developer tools for specific error messages

### Debug Mode

Enable debug logging by setting `DEBUG=true` in the API service configuration.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the GitHub issues
3. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core medical billing features
- **v1.0.1** - Added CloudFront deployment automation
- **v1.0.2** - Enhanced UI/UX and performance optimizations

---

**Built with ❤️ for healthcare providers and medical billing professionals**
