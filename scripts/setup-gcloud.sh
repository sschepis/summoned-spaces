#!/bin/bash

# Google Cloud Setup Script for Summoned Spaces
# This script helps you set up your Google Cloud environment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Google Cloud Setup for Summoned Spaces${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed.${NC}"
    echo -e "${YELLOW}Please install it from: https://cloud.google.com/sdk/docs/install${NC}"
    echo -e "${YELLOW}For macOS: brew install google-cloud-sdk${NC}"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI is installed${NC}"

# Get or create project
echo -e "${YELLOW}Enter your Google Cloud Project ID (or press Enter to create a new one):${NC}"
read -r PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    # Generate a unique project ID
    PROJECT_ID="summoned-spaces-$(date +%s)"
    echo -e "${YELLOW}Creating new project: ${PROJECT_ID}${NC}"
    gcloud projects create $PROJECT_ID --name="Summoned Spaces"
fi

# Set the project
echo -e "${YELLOW}Setting active project to: ${PROJECT_ID}${NC}"
gcloud config set project $PROJECT_ID

# Link billing account
echo -e "${YELLOW}Checking billing...${NC}"
BILLING_ENABLED=$(gcloud beta billing projects describe $PROJECT_ID --format="value(billingEnabled)" 2>/dev/null || echo "false")

if [ "$BILLING_ENABLED" != "True" ]; then
    echo -e "${RED}⚠️  Billing is not enabled for this project.${NC}"
    echo -e "${YELLOW}Available billing accounts:${NC}"
    gcloud beta billing accounts list
    echo -e "${YELLOW}Enter the billing account ID to link (format: XXXXXX-XXXXXX-XXXXXX):${NC}"
    read -r BILLING_ACCOUNT
    if [ ! -z "$BILLING_ACCOUNT" ]; then
        gcloud beta billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
    fi
fi

# Enable required APIs
echo -e "${YELLOW}Enabling required Google Cloud APIs...${NC}"
apis=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "containerregistry.googleapis.com"
    "appengine.googleapis.com"
    "compute.googleapis.com"
    "secretmanager.googleapis.com"
)

for api in "${apis[@]}"; do
    echo -e "Enabling ${api}..."
    gcloud services enable $api
done

echo -e "${GREEN}✅ APIs enabled successfully${NC}"

# Set default region
echo -e "${YELLOW}Select your preferred region:${NC}"
echo "1) us-central1 (Iowa)"
echo "2) us-east1 (South Carolina)"
echo "3) us-west1 (Oregon)"
echo "4) europe-west1 (Belgium)"
echo "5) asia-east1 (Taiwan)"
read -r REGION_CHOICE

case $REGION_CHOICE in
    1) REGION="us-central1";;
    2) REGION="us-east1";;
    3) REGION="us-west1";;
    4) REGION="europe-west1";;
    5) REGION="asia-east1";;
    *) REGION="us-central1";;
esac

echo -e "${YELLOW}Setting default region to: ${REGION}${NC}"
gcloud config set run/region $REGION
gcloud config set compute/region $REGION

# Create App Engine app (if using App Engine)
echo -e "${YELLOW}Do you want to use App Engine? (y/n):${NC}"
read -r USE_APP_ENGINE

if [ "$USE_APP_ENGINE" = "y" ]; then
    echo -e "${YELLOW}Creating App Engine app...${NC}"
    gcloud app create --region=$REGION || echo "App Engine app already exists"
fi

# Configure Docker
echo -e "${YELLOW}Configuring Docker authentication...${NC}"
gcloud auth configure-docker

# Create a service account for CI/CD (optional)
echo -e "${YELLOW}Do you want to create a service account for CI/CD? (y/n):${NC}"
read -r CREATE_SA

if [ "$CREATE_SA" = "y" ]; then
    SA_NAME="summoned-spaces-ci"
    SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    echo -e "${YELLOW}Creating service account...${NC}"
    gcloud iam service-accounts create $SA_NAME \
        --display-name="Summoned Spaces CI/CD"
    
    # Grant necessary roles
    roles=(
        "roles/run.admin"
        "roles/storage.admin"
        "roles/cloudbuild.builds.editor"
    )
    
    for role in "${roles[@]}"; do
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:${SA_EMAIL}" \
            --role="$role"
    done
    
    # Create and download key
    gcloud iam service-accounts keys create ./service-account-key.json \
        --iam-account=$SA_EMAIL
    
    echo -e "${GREEN}✅ Service account created and key saved to ./service-account-key.json${NC}"
    echo -e "${RED}⚠️  Keep this key secure and add it to .gitignore!${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}✅ Google Cloud Setup Complete!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update .env.production with your database credentials"
echo -e "2. Run: ${GREEN}./scripts/deploy-cloud-run.sh ${PROJECT_ID} ${REGION}${NC}"
echo -e "   OR"
echo -e "   Run: ${GREEN}./scripts/deploy-app-engine.sh ${PROJECT_ID}${NC}"
echo ""
echo -e "${YELLOW}For manual deployment, see DEPLOYMENT.md${NC}"

# Save configuration
echo -e "${YELLOW}Saving configuration...${NC}"
cat > ./gcloud-config.sh << EOF
#!/bin/bash
# Google Cloud Configuration for Summoned Spaces
export GOOGLE_CLOUD_PROJECT="${PROJECT_ID}"
export GOOGLE_CLOUD_REGION="${REGION}"
export SERVICE_NAME="summoned-spaces"
EOF

chmod +x ./gcloud-config.sh
echo -e "${GREEN}✅ Configuration saved to ./gcloud-config.sh${NC}"