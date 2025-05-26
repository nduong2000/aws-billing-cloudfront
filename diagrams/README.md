# Medical Billing System - Architecture Diagrams

This directory contains comprehensive architecture diagrams for the Medical Billing System, showing both frontend and backend components, their interactions, and deployment pipelines.

## 📊 Available Diagrams

### 1. Frontend Architecture (`frontend-architecture.*`)
**Purpose**: Shows the React frontend application structure, AWS CloudFront deployment, and CI/CD pipeline.

**Key Components**:
- **React Application**: SPA with React Router for navigation
- **AWS Infrastructure**: CloudFront distribution, S3 static hosting
- **CI/CD Pipeline**: GitHub Actions automated deployment
- **Page Structure**: All major pages (Patients, Providers, Claims, Audit, etc.)
- **Caching Strategy**: CloudFront cache configuration

**Files**:
- `frontend-architecture.mermaid` - Source diagram
- `frontend-architecture.svg` - Rendered SVG

### 2. Backend Architecture (`backend-architecture.*`)
**Purpose**: Illustrates the Python FastAPI backend running on AWS Lambda, database connections, and AI integrations.

**Key Components**:
- **AWS Lambda**: Containerized FastAPI application
- **Database Layer**: PostgreSQL with all medical billing tables
- **API Routes**: RESTful endpoints for all business functions
- **AI Services**: Ollama LLM and AWS Bedrock integration
- **External Integrations**: Insurance APIs, payment gateways
- **Monitoring**: CloudWatch logs and metrics

**Files**:
- `backend-architecture.mermaid` - Source diagram
- `backend-architecture.svg` - Rendered SVG

### 3. System Overview (`system-overview.*`)
**Purpose**: Comprehensive view showing how frontend and backend work together as a complete medical billing system.

**Key Components**:
- **End-to-End Flow**: From user interaction to data persistence
- **Service Integration**: How all components communicate
- **Data Flow**: Patient → Provider → Claims → Payments → Audit
- **AI Integration**: Fraud detection and claim auditing
- **External Systems**: Insurance, payment processing, HL7 FHIR

**Files**:
- `system-overview.mermaid` - Source diagram
- `system-overview.svg` - Rendered SVG

## 🎨 Diagram Color Coding

The diagrams use consistent color coding to help identify component types:

- **🟠 AWS Services**: Orange (#ff9900) - CloudFront, S3, Lambda, ECR, etc.
- **🔵 React Components**: Light Blue (#61dafb) - React pages, router, components
- **🟢 API/Backend**: Green (#4caf50) - FastAPI, API routes, services
- **🔵 Python/FastAPI**: Blue (#3776ab) - Python-specific components
- **🟦 Database**: Dark Blue (#336791) - PostgreSQL, tables
- **🔴 AI Services**: Red (#ff6b6b) - Ollama, Bedrock, ML models
- **🟤 External Services**: Brown (#795548) - Third-party integrations
- **🔵 CI/CD**: Blue (#2196f3) - GitHub Actions, deployment
- **🟣 Users**: Purple (#9c27b0) - End users, administrators

## 🚀 Current Deployment Status

### Frontend
- **CloudFront Distribution**: `d27z0qz3ducsem.cloudfront.net`
- **S3 Bucket**: `medical-billing-frontend-v2-20250526`
- **Deployment**: Automated via GitHub Actions
- **Status**: ✅ Active with navigation features

### Backend
- **AWS Lambda**: Python FastAPI container
- **Database**: PostgreSQL (configured via environment)
- **AI Integration**: Ollama + AWS Bedrock
- **Status**: 🔄 Development/Testing

## 📋 Key Features Illustrated

### Medical Billing Workflow
1. **Patient Management**: Registration, demographics, insurance
2. **Provider Management**: Healthcare provider information
3. **Service Codes**: Medical procedures and billing codes
4. **Appointments**: Scheduling and management
5. **Claims Processing**: Insurance claim submission and tracking
6. **Payment Processing**: Payment collection and reconciliation
7. **AI Audit**: Automated fraud detection and claim validation

### Technical Features
- **Responsive UI**: Modern React SPA with navigation
- **RESTful API**: Comprehensive FastAPI backend
- **Real-time Processing**: Lambda-based serverless architecture
- **AI Integration**: LLM-powered claim auditing
- **Secure Deployment**: AWS best practices with proper caching
- **Automated CI/CD**: GitHub Actions for both frontend and backend

## 🔧 Viewing the Diagrams

### Online Viewers
- **Mermaid Live Editor**: https://mermaid.live/
- **GitHub**: Automatically renders `.mermaid` files
- **VS Code**: Mermaid preview extensions available

### Local Viewing
```bash
# Install Mermaid CLI (if not already installed)
npm install -g @mermaid-js/mermaid-cli

# Generate SVG from Mermaid
mmdc -i diagram-name.mermaid -o diagram-name.svg

# View SVG in browser
open diagram-name.svg
```

## 📝 Updating Diagrams

When making changes to the system architecture:

1. Update the relevant `.mermaid` file
2. Regenerate the SVG: `mmdc -i diagram.mermaid -o diagram.svg`
3. Update this README if new components are added
4. Commit both `.mermaid` and `.svg` files

## 🏗️ Architecture Decisions

### Frontend
- **React Router**: Client-side routing for SPA experience
- **CloudFront**: Global CDN for fast content delivery
- **S3 Static Hosting**: Cost-effective static site hosting
- **Vite Build**: Fast development and optimized production builds

### Backend
- **FastAPI**: Modern Python web framework with automatic API docs
- **AWS Lambda**: Serverless, auto-scaling compute
- **Container Deployment**: Docker for consistent environments
- **PostgreSQL**: Robust relational database for medical data

### AI Integration
- **Ollama**: Local LLM for development and testing
- **AWS Bedrock**: Production-grade AI services
- **Fraud Detection**: Pattern analysis for claim validation

This architecture provides a scalable, secure, and modern medical billing system with AI-powered features for enhanced claim processing and fraud detection. 