#!/bin/bash

# Summoned Spaces - Linode Deployment Script
# This script automates the deployment process to a Linode server

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_USER="summoned"
REMOTE_DIR="/home/summoned/summoned-spaces"
ENV_FILE=".env.production"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required arguments are provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <linode-ip> [environment]"
    echo "Example: $0 192.168.1.100 production"
    exit 1
fi

LINODE_IP=$1
ENVIRONMENT=${2:-production}

print_status "Starting deployment to Linode server at $LINODE_IP"

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "$ENV_FILE not found. Please create it first."
    echo "Copy .env.production.example to $ENV_FILE and update the values."
    exit 1
fi

# Check SSH connection
print_status "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 "$REMOTE_USER@$LINODE_IP" "echo 'SSH connection successful'"; then
    print_error "Failed to connect to server. Check your SSH key and server IP."
    exit 1
fi

# Create remote directory if it doesn't exist
print_status "Setting up remote directory..."
ssh "$REMOTE_USER@$LINODE_IP" "mkdir -p $REMOTE_DIR"

# Sync files to server (excluding unnecessary files)
print_status "Syncing files to server..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --exclude '.env.development' \
    --exclude 'summoned-spaces.db' \
    --exclude 'postgres-data' \
    --exclude 'uploads' \
    --exclude '.DS_Store' \
    ./ "$REMOTE_USER@$LINODE_IP:$REMOTE_DIR/"

# Copy environment file
print_status "Copying environment configuration..."
scp "$ENV_FILE" "$REMOTE_USER@$LINODE_IP:$REMOTE_DIR/.env"

# Execute deployment on remote server
print_status "Executing remote deployment..."
ssh "$REMOTE_USER@$LINODE_IP" << 'ENDSSH'
cd /home/summoned/summoned-spaces

echo "Stopping existing containers..."
docker-compose -f docker-compose.linode.yml down || true

echo "Building and starting containers..."
docker-compose -f docker-compose.linode.yml up -d --build

echo "Waiting for services to be healthy..."
sleep 10

echo "Checking container status..."
docker-compose -f docker-compose.linode.yml ps

echo "Running database migrations..."
docker-compose -f docker-compose.linode.yml exec -T app npm run migrate || echo "No migrations to run"

echo "Deployment completed!"
ENDSSH

# Check deployment status
print_status "Verifying deployment..."
if ssh "$REMOTE_USER@$LINODE_IP" "cd $REMOTE_DIR && docker-compose -f docker-compose.linode.yml ps | grep -q 'Up'"; then
    print_status "Deployment successful! ✅"
    echo ""
    echo "Your application is now running at:"
    echo "  http://$LINODE_IP"
    echo ""
    echo "Next steps:"
    echo "1. Configure your domain DNS to point to $LINODE_IP"
    echo "2. Run: ./scripts/setup-ssl.sh $LINODE_IP yourdomain.com"
    echo "3. Monitor logs: ssh $REMOTE_USER@$LINODE_IP 'cd $REMOTE_DIR && docker-compose -f docker-compose.linode.yml logs -f'"
else
    print_error "Deployment may have failed. Check the logs."
    ssh "$REMOTE_USER@$LINODE_IP" "cd $REMOTE_DIR && docker-compose -f docker-compose.linode.yml logs --tail=50"
    exit 1
fi