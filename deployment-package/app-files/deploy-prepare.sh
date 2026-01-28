#!/bin/bash

# Deployment Preparation Script for Shared Hosting
# This script prepares your Laravel app for deployment

echo "======================================"
echo "BukuKira - Deployment Preparation"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if required tools are installed
echo -e "${YELLOW}Step 1: Checking required tools...${NC}"
command -v composer >/dev/null 2>&1 || { echo -e "${RED}Composer is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }
command -v php >/dev/null 2>&1 || { echo -e "${RED}PHP is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ All required tools are installed${NC}"
echo ""

# Step 2: Clear existing caches
echo -e "${YELLOW}Step 2: Clearing existing caches...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo -e "${GREEN}✓ Caches cleared${NC}"
echo ""

# Step 3: Install production dependencies
echo -e "${YELLOW}Step 3: Installing production PHP dependencies...${NC}"
composer install --optimize-autoloader --no-dev
echo -e "${GREEN}✓ PHP dependencies installed${NC}"
echo ""

# Step 4: Install and build frontend assets
echo -e "${YELLOW}Step 4: Building frontend assets...${NC}"
npm install
npm run build
echo -e "${GREEN}✓ Frontend assets built${NC}"
echo ""

# Step 5: Optimize for production
echo -e "${YELLOW}Step 5: Optimizing for production...${NC}"
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✓ Optimization complete${NC}"
echo ""

# Step 6: Create deployment package
echo -e "${YELLOW}Step 6: Creating deployment package...${NC}"

# Create deployment directory
mkdir -p deployment-package
mkdir -p deployment-package/app-files
mkdir -p deployment-package/public-files

# Copy application files (excluding public)
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude 'public' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'deployment-package' \
  --exclude 'tests' \
  --exclude '.env.example' \
  --exclude 'storage/logs/*' \
  --exclude 'storage/framework/cache/*' \
  --exclude 'storage/framework/sessions/*' \
  --exclude 'storage/framework/views/*' \
  ./ deployment-package/app-files/

# Copy public files
rsync -av --progress public/ deployment-package/public-files/

# Copy production .env
cp .env.production deployment-package/app-files/.env

echo -e "${GREEN}✓ Deployment package created${NC}"
echo ""

# Step 7: Display summary
echo "======================================"
echo -e "${GREEN}Deployment Preparation Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Upload 'deployment-package/app-files/*' to your server's app directory (e.g., ~/bukukira-app/)"
echo "2. Upload 'deployment-package/public-files/*' to your subdomain's public directory (e.g., ~/public_html/bukukira/)"
echo "3. Update 'public/index.php' paths to point to your app directory"
echo "4. Set proper file permissions (see DEPLOYMENT_GUIDE.md)"
echo "5. Run migrations on the server: php artisan migrate --force"
echo "6. Create storage link: php artisan storage:link"
echo ""
echo "Files are ready in the 'deployment-package' folder!"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
