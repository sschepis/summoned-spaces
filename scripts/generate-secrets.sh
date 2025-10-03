#!/bin/bash

# Script to generate secure secrets for production deployment

echo "Generating secure secrets for Summoned Spaces deployment..."
echo ""

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
SESSION_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

echo "Generated secrets:"
echo "=================="
echo ""
echo "DB_PASSWORD=$DB_PASSWORD"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "Database URL format:"
echo "DATABASE_URL=postgresql://summoned:$DB_PASSWORD@postgres:5432/summoned_spaces"
echo ""
echo "Redis URL format:"
echo "REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379"
echo ""
echo "IMPORTANT: Copy these values to your .env.production file"
echo "WARNING: This is the only time you'll see these passwords. Save them securely!"