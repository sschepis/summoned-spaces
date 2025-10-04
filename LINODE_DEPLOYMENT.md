# Linode Deployment Guide for Summoned Spaces

This guide provides comprehensive instructions for deploying the Summoned Spaces application to Linode.

## Prerequisites

1. **Linode Account**: Create a Linode account at https://www.linode.com
2. **Linode CLI**: Install the Linode CLI tool
   ```bash
   # macOS
   brew install linode-cli
   
   # Or via pip
   pip install linode-cli
   ```
3. **Docker**: Ensure Docker is installed locally for building images
4. **SSH Key**: Generate an SSH key if you don't have one
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

## Deployment Architecture

We'll deploy Summoned Spaces using:
- **Linode Compute Instance**: For running the application
- **Docker & Docker Compose**: For containerization
- **Nginx**: As a reverse proxy with SSL
- **PostgreSQL**: Database (can use Linode Managed Database or self-hosted)
- **Let's Encrypt**: For SSL certificates

## Step 1: Create a Linode Instance

### Using Linode CLI:
```bash
linode-cli linodes create \
  --label summoned-spaces \
  --root_pass 'YourSecurePassword123!' \
  --region us-east \
  --type g6-standard-2 \
  --image linode/ubuntu22.04 \
  --authorized_keys "$(cat ~/.ssh/id_rsa.pub)"
```

### Or via Linode Dashboard:
1. Log in to Linode Dashboard
2. Click "Create" → "Linode"
3. Choose:
   - Distribution: Ubuntu 22.04 LTS
   - Region: Choose closest to your users
   - Plan: Shared CPU → Linode 4GB (minimum recommended)
   - Label: summoned-spaces
   - Root Password: Set a secure password
   - SSH Keys: Add your public key

## Step 2: Initial Server Setup

1. **Connect to your server**:
   ```bash
   ssh root@YOUR_LINODE_IP
   ```

2. **Update the system**:
   ```bash
   apt update && apt upgrade -y
   ```

3. **Create a non-root user**:
   ```bash
   adduser summoned
   usermod -aG sudo summoned
   ```

4. **Copy SSH keys to new user**:
   ```bash
   rsync --archive --chown=summoned:summoned ~/.ssh /home/summoned
   ```

5. **Setup firewall**:
   ```bash
   ufw allow OpenSSH
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw --force enable
   ```

## Step 3: Install Docker and Docker Compose

```bash
# Switch to the new user
su - summoned

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out and back in to apply group changes
exit
ssh summoned@YOUR_LINODE_IP

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 4: Setup PostgreSQL Database

### Option A: Use Linode Managed Database (Recommended)
1. Create a PostgreSQL database in Linode Dashboard
2. Note the connection details
3. Update your `.env.production` with the connection string

### Option B: Self-hosted PostgreSQL
```bash
# Create a directory for PostgreSQL data
mkdir -p ~/summoned-spaces/postgres-data

# PostgreSQL will be included in our docker-compose.yml
```

## Step 5: Deploy the Application

1. **Create deployment directory**:
   ```bash
   mkdir -p ~/summoned-spaces
   cd ~/summoned-spaces
   ```

2. **Clone your repository** (or upload files):
   ```bash
   git clone https://github.com/YOUR_USERNAME/summoned-spaces.git .
   # Or use SCP to upload files
   ```

3. **Create production environment file**:
   ```bash
   cp .env.production .env
   nano .env
   ```

   Update with your production values:
   ```env
   NODE_ENV=production
   PORT=8080
   DATABASE_URL=postgresql://user:password@localhost:5432/summoned_spaces
   SESSION_SECRET=your-very-secure-session-secret
   JWT_SECRET=your-very-secure-jwt-secret
   ```

4. **Build and start the application**:
   ```bash
   docker-compose -f docker-compose.linode.yml up -d --build
   ```

## Step 6: Setup Nginx with SSL

1. **Install Certbot**:
   ```bash
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   ```

2. **Configure Nginx** (included in docker-compose):
   The nginx configuration will be automatically set up via Docker Compose.

3. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Step 7: Setup Monitoring and Backups

### Monitoring with Linode Longview:
```bash
curl -s https://lv.linode.com/LONGVIEW_KEY | sudo bash
```

### Automated Backups:
1. Enable Linode Backups in the dashboard
2. Setup database backups:
   ```bash
   # Create backup script
   cat > ~/backup-database.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/home/summoned/backups"
   mkdir -p $BACKUP_DIR
   docker exec summoned-spaces-postgres pg_dump -U postgres summoned_spaces | gzip > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz
   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete
   EOF
   
   chmod +x ~/backup-database.sh
   
   # Add to crontab
   (crontab -l 2>/dev/null; echo "0 2 * * * /home/summoned/backup-database.sh") | crontab -
   ```

## Step 8: Domain Configuration

1. **Update DNS records**:
   - A Record: `@` → YOUR_LINODE_IP
   - A Record: `www` → YOUR_LINODE_IP

2. **Wait for DNS propagation** (can take up to 48 hours)

## Deployment Commands Reference

### Start application:
```bash
cd ~/summoned-spaces
docker-compose -f docker-compose.linode.yml up -d
```

### Stop application:
```bash
docker-compose -f docker-compose.linode.yml down
```

### View logs:
```bash
docker-compose -f docker-compose.linode.yml logs -f
```

### Update application:
```bash
git pull origin main
docker-compose -f docker-compose.linode.yml up -d --build
```

### Database migrations:
```bash
docker-compose -f docker-compose.linode.yml exec app npm run migrate
```

## Troubleshooting

### Check application status:
```bash
docker-compose -f docker-compose.linode.yml ps
```

### Check logs:
```bash
# All services
docker-compose -f docker-compose.linode.yml logs

# Specific service
docker-compose -f docker-compose.linode.yml logs app
```

### Restart services:
```bash
docker-compose -f docker-compose.linode.yml restart
```

### Database connection issues:
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running
3. Check firewall rules
4. Review connection logs

### Performance issues:
1. Check server resources: `htop`
2. Review Docker stats: `docker stats`
3. Check disk space: `df -h`
4. Consider upgrading Linode plan

## Security Best Practices

1. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Fail2ban Installation**:
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

3. **SSH Hardening**:
   - Disable root login
   - Use SSH keys only
   - Change default SSH port

4. **Regular Backups**:
   - Enable Linode automatic backups
   - Implement database backup strategy
   - Test restore procedures

## Cost Optimization

1. **Right-size your Linode**:
   - Start with Linode 4GB
   - Monitor usage and scale as needed

2. **Use Object Storage for files**:
   - Store uploaded files in Linode Object Storage
   - Reduces compute instance storage needs

3. **Implement caching**:
   - Use Redis for session storage
   - Implement CDN for static assets

## Support and Resources

- [Linode Documentation](https://www.linode.com/docs/)
- [Linode Community](https://www.linode.com/community/)
- [Docker Documentation](https://docs.docker.com/)
- Application Issues: Check the repository issues page

## Next Steps

1. Setup CI/CD pipeline
2. Configure monitoring alerts
3. Implement log aggregation
4. Setup staging environment
5. Configure CDN for static assets