# AWS EC2 Deployment Checklist for GameHub Pro

## ✅ Pre-Deployment Verification

### 1. Run Production Readiness Check
```bash
chmod +x check-production-ready.sh
./check-production-ready.sh
```

### 2. Verify Critical Configurations

#### Database Configuration ✅
- [x] AWS RDS PostgreSQL connection string configured
- [x] SSL settings compatible with AWS RDS
- [x] Connection pooling configured (MAX_CONNECTIONS=20)
- [x] Drizzle migrations generated and committed

#### Server Configuration ✅  
- [x] Server binds to 0.0.0.0 in production (not 127.0.0.1)
- [x] Port 3000 configured for AWS compatibility
- [x] CORS origins set for gameschakra.com
- [x] Trust proxy enabled for AWS load balancers

#### PM2 Configuration ✅
- [x] Ecosystem config optimized for AWS EC2
- [x] Log files configured with proper paths
- [x] Memory limits set for t2.micro compatibility
- [x] Environment file loading configured

#### Environment Variables ✅
- [x] .env.production.aws template created
- [x] All required variables documented
- [x] Secure session secret generation
- [x] Production-specific settings included

## 🚀 Deployment Process

### Option 1: Automated Deployment (Recommended)

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Run the automated deployment script:**
   ```bash
   curl -O https://raw.githubusercontent.com/gameschakra/Gameschakra-Replit-code/main/deploy-to-aws.sh
   chmod +x deploy-to-aws.sh
   ./deploy-to-aws.sh
   ```

### Option 2: Manual Deployment

Follow the step-by-step guide in `MANUAL-DEPLOYMENT-STEPS.md`

## 🔍 Post-Deployment Verification

### 1. Check Service Status
```bash
pm2 status
sudo systemctl status nginx
```

### 2. Test Health Endpoint
```bash
curl -v http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production",
  "database": {"status": "connected"},
  "disk": {"uploads": "accessible", "migrations": "found"}
}
```

### 3. Test Frontend Access
```bash
curl -I http://localhost/
```

Expected: `200 OK` with HTML content

### 4. Test API Endpoints
```bash
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/games
```

## 🌐 Domain Configuration

### 1. Point DNS to EC2
Update your domain registrar with:
- `A` record: `gameschakra.com` → `your-ec2-ip`  
- `A` record: `www.gameschakra.com` → `your-ec2-ip`

### 2. Set up SSL Certificate (Optional but Recommended)
```bash
sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com
```

## 📊 Monitoring & Maintenance

### View Logs
```bash
# Application logs
pm2 logs gameschakra

# Nginx logs  
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Performance Monitoring
```bash
# System resources
htop
free -h
df -h

# Application metrics
curl http://localhost:3000/api/health
```

### Maintenance Commands
```bash
# Restart application
pm2 restart gameschakra

# Reload Nginx
sudo systemctl reload nginx

# Update application
cd /var/www/gameschakra
git pull origin main
npm run build
npm run db:setup:prod
pm2 restart gameschakra
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs gameschakra

# Check environment variables
cat /var/www/gameschakra/.env.production

# Restart with verbose logging
pm2 restart gameschakra --log-level debug
```

#### Database Connection Issues
```bash
# Test database connectivity
cd /var/www/gameschakra
npm run db:studio

# Check environment variables
echo $DATABASE_URL
grep DATABASE_URL .env.production
```

#### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

#### Memory Issues (t2.micro)
```bash
# Check memory usage
free -h

# Reduce PM2 memory limit
# Edit ecosystem.config.cjs: max_memory_restart: '256M'
pm2 restart gameschakra
```

### Emergency Recovery
```bash
# Stop all services
pm2 stop all
sudo systemctl stop nginx

# Start services one by one
sudo systemctl start nginx
pm2 start ecosystem.config.cjs

# Check health
curl http://localhost:3000/api/health
```

## 📋 Verification Checklist

After deployment, verify:

- [ ] PM2 shows application as "online"
- [ ] Health endpoint returns status "healthy" 
- [ ] Frontend loads at EC2 IP address
- [ ] API endpoints respond correctly
- [ ] Database queries work (categories, games)
- [ ] File uploads directory is accessible
- [ ] Nginx serves static files correctly
- [ ] Domain points to EC2 (if configured)
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Logs are being written properly

## 🎉 Success Criteria

Your GameHub Pro deployment is successful when:

1. ✅ All services running without errors
2. ✅ Health check returns "healthy" status
3. ✅ Website accessible via domain/IP
4. ✅ Database operations working
5. ✅ File uploads functioning
6. ✅ No critical errors in logs

---

**Your GameHub Pro is now production-ready for AWS deployment! 🚀**