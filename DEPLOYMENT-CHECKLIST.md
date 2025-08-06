# 🚀 GameSchakra Production Deployment Checklist

## Pre-Deployment Security Checklist

### ⚠️ CRITICAL - Change These Before Deployment
- [ ] **Generate strong SESSION_SECRET** (min 32 characters)
- [ ] **Generate strong ADMIN_TOKEN** (min 32 characters)  
- [ ] **Update CORS_ORIGIN** to production domain only
- [ ] **Verify DATABASE_URL** uses SSL (`sslmode=require`)
- [ ] **Change default admin password** after first login

### 🔧 Environment Configuration
- [ ] Create `.env.production` with production values
- [ ] Remove any hardcoded credentials from code
- [ ] Verify all required env vars are set
- [ ] Test environment loading logic

## AWS Infrastructure Setup

### EC2 Instance
- [ ] Launch EC2 instance (t3.medium recommended)
- [ ] Allocate and associate Elastic IP
- [ ] Configure security groups (see aws-security-setup.md)
- [ ] Enable CloudWatch monitoring
- [ ] Setup automated backups

### RDS Database
- [ ] Verify RDS instance is running
- [ ] Confirm SSL is enforced
- [ ] Test connection from EC2
- [ ] Setup automated backups
- [ ] Configure parameter groups

### DNS Configuration (Hostinger)
- [ ] Point A record @ to EC2 Elastic IP
- [ ] Point A record www to EC2 Elastic IP
- [ ] Verify DNS propagation (use dig or nslookup)

## Step-by-Step Deployment Commands

### 1. Connect to EC2 Instance
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 2. Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional packages
sudo apt-get install -y nginx git certbot python3-certbot-nginx htop

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/gameschakra
sudo chown $USER:$USER /var/www/gameschakra

# Create log directory
sudo mkdir -p /var/log/gameschakra
sudo chown $USER:$USER /var/log/gameschakra
```

### 3. Deploy Application Code
```bash
# Navigate to app directory
cd /var/www/gameschakra

# Clone repository (replace with your repo)
git clone https://github.com/your-username/gameschakra.git .

# Copy production environment file
cp .env.production.example .env.production
nano .env.production  # Edit with real values

# Install dependencies
npm ci --production=false

# Generate database migrations
npm run db:generate

# Build application
npm run build

# Run database migrations
npm run db:migrate

# Create admin user
npx tsx scripts/create-admin.ts
```

### 4. Configure Nginx
```bash
# Install Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/gameschakra.com

# Test Nginx configuration
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/gameschakra.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx
sudo systemctl restart nginx
```

### 5. Setup SSL Certificate
```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 6. Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command shown by PM2 startup (as root)

# Verify application is running
pm2 list
pm2 logs gameschakra
```

### 7. Verify Deployment
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test HTTPS
curl -I https://gameschakra.com/api/health

# Check SSL certificate
curl -I https://gameschakra.com

# Test website in browser
# Visit: https://gameschakra.com
```

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Website loads correctly
- [ ] Admin login works
- [ ] Game uploads work
- [ ] Static files serve correctly
- [ ] API endpoints respond
- [ ] Database connections stable

### ✅ Security Tests
- [ ] HTTPS enforced (HTTP redirects)
- [ ] Security headers present
- [ ] Admin panel protected
- [ ] File uploads restricted
- [ ] Rate limiting works
- [ ] CORS configured correctly

### ✅ Performance Tests
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] Static assets cached
- [ ] Gzip compression working
- [ ] Memory usage normal

## Monitoring & Maintenance

### Setup Monitoring
```bash
# Install system monitoring
sudo apt install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/gameschakra
```

### Log Commands
```bash
# Application logs
pm2 logs gameschakra

# Nginx logs  
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

### Maintenance Commands
```bash
# Update application
cd /var/www/gameschakra
git pull origin main
npm ci
npm run build
npm run db:migrate
pm2 restart gameschakra

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up logs
pm2 flush
sudo logrotate -f /etc/logrotate.conf

# Monitor resources
htop
df -h
free -m
```

## Troubleshooting Guide

### Common Issues

#### 1. Website Not Loading
```bash
# Check if application is running
pm2 list

# Check application logs
pm2 logs gameschakra

# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql "postgresql://user:pass@host:5432/db?sslmode=require"

# Check environment variables
printenv | grep DATABASE_URL

# Check security groups in AWS console
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

#### 4. Performance Issues
```bash
# Check system resources
htop
df -h
iostat

# Check application performance
pm2 monit

# Check database connections  
# In DB: SELECT * FROM pg_stat_activity;
```

## Rollback Plan

### If Deployment Fails
```bash
# Stop current application
pm2 stop gameschakra

# Revert to previous version
git checkout previous-working-commit

# Rebuild and restart
npm run build
pm2 restart gameschakra

# Or restore from backup
# Restore database snapshot in AWS RDS console
```

## Success Criteria

### ✅ Deployment Complete When:
- [ ] HTTPS website accessible at gameschakra.com
- [ ] Admin panel accessible and secure
- [ ] All functionality working correctly
- [ ] SSL certificate installed and valid
- [ ] Performance within acceptable limits
- [ ] Monitoring and logs configured
- [ ] Auto-renewal for SSL setup
- [ ] PM2 configured for auto-restart
- [ ] Backup strategy confirmed

## Optional Improvements

### Performance
- [ ] Setup CloudFront CDN
- [ ] Enable Redis caching
- [ ] Optimize database indexes
- [ ] Implement image optimization

### Security
- [ ] Setup fail2ban
- [ ] Configure firewall (UFW)
- [ ] Setup intrusion detection
- [ ] Regular security updates automation

### Monitoring
- [ ] Setup AWS CloudWatch alarms
- [ ] Configure uptime monitoring
- [ ] Setup email alerts
- [ ] Performance monitoring dashboard