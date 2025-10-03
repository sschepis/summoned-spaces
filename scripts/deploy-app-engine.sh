#!/bin/bash

# Deploy to Google App Engine
# Usage: ./scripts/deploy-app-engine.sh [PROJECT_ID]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
PROJECT_ID=${1:-"your-project-id"}

echo -e "${YELLOW}🚀 Starting deployment to Google App Engine${NC}"
echo -e "Project ID: ${PROJECT_ID}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Authenticate with Google Cloud
echo -e "${YELLOW}📝 Authenticating with Google Cloud...${NC}"
gcloud auth login

# Set the project
echo -e "${YELLOW}🔧 Setting project...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}🔌 Enabling required APIs...${NC}"
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create App Engine app if it doesn't exist
echo -e "${YELLOW}🏗️  Creating App Engine app (if needed)...${NC}"
gcloud app create --region=us-central || echo "App Engine app already exists"

# Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build

# Deploy to App Engine
echo -e "${YELLOW}🚀 Deploying to App Engine...${NC}"
gcloud app deploy app.yaml --quiet

# Deploy cron jobs if cron.yaml exists
if [ -f "cron.yaml" ]; then
    echo -e "${YELLOW}⏰ Deploying cron jobs...${NC}"
    gcloud app deploy cron.yaml --quiet
fi

# Deploy dispatch rules if dispatch.yaml exists
if [ -f "dispatch.yaml" ]; then
    echo -e "${YELLOW}🔀 Deploying dispatch rules...${NC}"
    gcloud app deploy dispatch.yaml --quiet
fi

# Get the service URL
SERVICE_URL="https://${PROJECT_ID}.appspot.com"

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Your application is available at: ${SERVICE_URL}${NC}"

# View logs
echo -e "${YELLOW}📋 To view logs, run:${NC}"
echo -e "   gcloud app logs tail -s default"

# Browse the app
echo -e "${YELLOW}🌐 To open the app in your browser, run:${NC}"
echo -e "   gcloud app browse"