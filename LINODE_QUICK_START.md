# Summoned Spaces - Linode Quick Start Guide

This is a quick reference guide for deploying Summoned Spaces to Linode. For detailed instructions, see [LINODE_DEPLOYMENT.md](./LINODE_DEPLOYMENT.md).

## Prerequisites Checklist

- [ ] Linode account created
- [ ] SSH key generated (`ssh-keygen -t rsa -b 4096`)
- [ ] Domain name (optional but recommended)
- [ ] Local Docker installed for testing

## Step-by-Step Deployment

### 1. Create Linode Instance

```bash
# Via Linode Dashboard:
# - Ubuntu 22.04 LTS
# - Linode 4GB (minimum)
# - Add your SSH key
# - Note the IP address
```

### 2. Initial Server Setup

```bash
# Connect to server
ssh root@YOUR_LINODE_IP

# Run initial setup
apt update && apt upgrade -y
adduser summoned
usermod -aG sudo summoned
rsync --archive --chown=summoned:summoned ~/.ssh /home/summoned

# Setup firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install Docker
su - summoned
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

### 3. Prepare Your Application

On your local machine:

```bash
# Create production environment file
cp .env.production.example .env.production
# Edit .env.production with your values

# Make scripts executable
chmod +x scripts/deploy-linode.sh
chmod +x scripts/setup-ssl.sh
```

### 4. Deploy Application

```bash
# Deploy to your Linode server
./scripts/deploy-linode.sh YOUR_LINODE_IP

# The script will:
# - Upload files
# - Build Docker images
# - Start all services
# - Run database migrations
```

### 5. Setup SSL (if you have a domain)

```bash
# First, point your domain to the Linode IP
# Then run:
./scripts/setup-ssl.sh YOUR_LINODE_IP yourdomain.com your-email@example.com
```

## Common Commands

### On the Linode Server

```bash
# SSH to server
ssh summoned@YOUR_LINODE_IP

# Navigate to app directory
cd ~/summoned-spaces

# View logs
docker-compose -f docker-compose.linode.yml logs -f

# Restart services
docker-compose -f docker-compose.linode.yml restart

# Stop services
docker-compose -f docker-compose.linode.yml down

# Update application
git pull
docker-compose -f docker-compose.linode.yml up -d --build

# Check service status
docker-compose -f docker-compose.linode.yml ps

# Database backup
docker exec summoned-spaces-postgres pg_dump -U summoned summoned_spaces > backup.sql
```

### From Your Local Machine

```bash
# Deploy updates
./scripts/deploy-linode.sh YOUR_LINODE_IP

# View remote logs
ssh summoned@YOUR_LINODE_IP 'cd summoned-spaces && docker-compose -f docker-compose.linode.yml logs -f'

# Copy files to server
scp file.txt summoned@YOUR_LINODE_IP:~/summoned-spaces/

# Create database backup locally
ssh summoned@YOUR_LINODE_IP 'docker exec summoned-spaces-postgres pg_dump -U summoned summoned_spaces' > local-backup.sql
```

## Troubleshooting

### Application not accessible

1. Check firewall: `sudo ufw status`
2. Check containers: `docker-compose -f docker-compose.linode.yml ps`
3. Check logs: `docker-compose -f docker-compose.linode.yml logs app`

### Database connection issues

1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running: `docker-compose -f docker-compose.linode.yml ps postgres`
3. Test connection: `docker-compose -f docker-compose.linode.yml exec postgres psql -U summoned -d summoned_spaces`

### SSL certificate issues

1. Verify DNS is pointing to server
2. Check port 80 is accessible
3. Review Certbot logs: `docker-compose -f docker-compose.linode.yml logs certbot`

## Monitoring

### Basic Health Check
```bash
curl http://YOUR_LINODE_IP/health
# or
curl https://yourdomain.com/health
```

### Resource Usage
```bash
# On server
htop  # CPU and memory
df -h  # Disk space
docker stats  # Container resources
```

### Linode Dashboard
- Monitor bandwidth usage
- Set up alerts
- Enable backups

## Security Reminders

1. **Keep system updated**: Run `apt update && apt upgrade` regularly
2. **Monitor logs**: Check for suspicious activity
3. **Backup regularly**: Both database and files
4. **Use strong passwords**: For database and user accounts
5. **Enable Linode backups**: In the Linode dashboard

## Support

- Check logs first: Most issues are revealed in logs
- Linode Support: Available 24/7 via ticket system
- Application issues: Check the repository issues page

---

For detailed explanations and advanced configurations, refer to [LINODE_DEPLOYMENT.md](./LINODE_DEPLOYMENT.md).