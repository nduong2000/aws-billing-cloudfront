#!/bin/bash

# GitHub Actions Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up GitHub Actions for Medical Billing Frontend${NC}"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📁 Initializing Git repository...${NC}"
    git init
    git branch -M main
fi

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}🔗 Please add your GitHub repository as origin:${NC}"
    echo -e "${BLUE}git remote add origin https://github.com/YOUR_USERNAME/aws-billing-cloudfront.git${NC}"
    echo ""
    read -p "Press Enter after adding the remote origin..."
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}📝 Creating .gitignore...${NC}"
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# AWS
.aws/
bucket-policy.json
cloudfront-config.json

# Temporary files
*.tmp
*.temp
EOF
fi

# Add all files and commit
echo -e "${YELLOW}📦 Adding files to Git...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${GREEN}✅ No changes to commit. Repository is up to date.${NC}"
else
    echo -e "${YELLOW}💾 Committing changes...${NC}"
    git commit -m "feat: setup GitHub Actions deployment workflows

- Add production deployment workflow (.github/workflows/deploy.yml)
- Add staging deployment workflow (.github/workflows/deploy-staging.yml)
- Add comprehensive setup documentation (GITHUB_ACTIONS_SETUP.md)
- Configure automated S3 and CloudFront deployment
- Add proper cache invalidation and optimization"
fi

echo -e "${GREEN}🎉 GitHub Actions setup completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Push to GitHub: ${BLUE}git push origin main${NC}"
echo "2. Set up AWS IAM user and GitHub secrets (see GITHUB_ACTIONS_SETUP.md)"
echo "3. Configure repository secrets in GitHub"
echo "4. Push changes to trigger first deployment"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "- Setup guide: ${BLUE}GITHUB_ACTIONS_SETUP.md${NC}"
echo "- Deployment guide: ${BLUE}DEPLOYMENT.md${NC}"
echo ""
echo -e "${GREEN}🔗 Useful commands:${NC}"
echo "- Push to production: ${BLUE}git push origin main${NC}"
echo "- Create staging branch: ${BLUE}git checkout -b develop && git push origin develop${NC}"
echo "- View workflows: Visit your GitHub repo → Actions tab" 