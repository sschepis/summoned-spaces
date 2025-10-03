#!/bin/bash

# SSL Setup Script for Summoned Spaces on Linode
# This script configures Let's Encrypt SSL certificates

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <linode-ip> <domain> [email]"
    echo "Example: $0 192.168.1.100 example.com admin@example.com"
    exit 1
fi

LINODE_IP=$1
DOMAIN=$2
EMAIL=${3:-"admin@$DOMAIN"}
REMOTE_USER="summoned"
REMOTE_DIR="/home/summoned/summoned-spaces"

print_status "Setting up SSL for $DOMAIN on server $LINODE_IP"

# Update Nginx configuration with the actual domain
print_status "Updating Nginx configuration..."
ssh "$REMOTE_USER@$LINODE_IP" << EOF
cd $REMOTE_DIR
# Backup original config
cp nginx/conf.d/summoned-spaces.conf nginx/conf.d/summoned-spaces.conf.bak

# Replace placeholder domain with actual domain
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/conf.d/summoned-spaces.conf

# Create directories for Certbot
mkdir -p certbot/conf
mkdir -p certbot/www

# Restart Nginx to apply changes
docker-compose -f docker-compose.linode.yml restart nginx
EOF

# Initial certificate request
print_status "Requesting SSL certificate from Let's Encrypt..."
ssh "$REMOTE_USER@$LINODE_IP" << EOF
cd $REMOTE_DIR

# Stop existing certbot container if running
docker-compose -f docker-compose.linode.yml stop certbot || true

# Request certificate
docker run -it --rm --name certbot \
    -v "\$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "\$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN
EOF

# Check if certificate was obtained successfully
if ssh "$REMOTE_USER@$LINODE_IP" "[ -f $REMOTE_DIR/certbot/conf/live/$DOMAIN/fullchain.pem ]"; then
    print_status "SSL certificate obtained successfully!"
    
    # Restart services with SSL
    print_status "Restarting services with SSL enabled..."
    ssh "$REMOTE_USER@$LINODE_IP" << EOF
cd $REMOTE_DIR
docker-compose -f docker-compose.linode.yml restart nginx
docker-compose -f docker-compose.linode.yml up -d certbot
EOF
    
    print_status "SSL setup completed! ✅"
    echo ""
    echo "Your application is now accessible at:"
    echo "  https://$DOMAIN"
    echo "  https://www.$DOMAIN"
    echo ""
    echo "Certificate will auto-renew via the certbot container."
else
    print_error "Failed to obtain SSL certificate"
    echo "Please check:"
    echo "1. DNS is properly configured (A records for $DOMAIN and www.$DOMAIN point to $LINODE_IP)"
    echo "2. Ports 80 and 443 are open on the server"
    echo "3. No other service is using these ports"
    exit 1
fi