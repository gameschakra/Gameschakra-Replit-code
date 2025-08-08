# Manual AWS EC2 Deployment Steps

## Prerequisites
- SSH access to your Ubuntu EC2 instance
- AWS RDS PostgreSQL database running
- Domain `gameschakra.com` ready to point to EC2

## Step-by-Step Commands

### 1. SSH into your EC2 instance
```bash
# From your local machine
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Install system dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js, npm, nginx, and other tools
sudo apt install -y git nodejs npm nginx curl

# Install PM2 globally
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version
nginx -v
```

### 3. Clone the repository
```bash
# Create directory and clone
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/gameschakra/Gameschakra-Replit-code.git gameschakra

# Set ownership
sudo chown -R $USER:$USER /var/www/gameschakra

# Navigate to project
cd /var/www/gameschakra
```

### 4. Install project dependencies
```bash
# Install Node.js dependencies
npm install

# Check if installation was successful
ls node_modules/
```

### 5. Create production environment file
```bash
# Create .env.production
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:Vipyad96!@beta-rds.ct0qaymyqs9f.ap-south-1.rds.amazonaws.com:5432/gameschakra
SESSION_SECRET=your-secure-session-secret-here
CORS_ORIGIN=https://gameschakra.com,https://www.gameschakra.com,http://gameschakra.com
MAX_FILE_SIZE=50000000
LOG_LEVEL=info
COOKIE_DOMAIN=gameschakra.com
EOF

# Generate a secure session secret
SECURE_SECRET=$(openssl rand -base64 32)
sed -i "s/your-secure-session-secret-here/$SECURE_SECRET/" .env.production

# Verify environment file
cat .env.production
```

### 6. Build the application
```bash
# Build the project
npm run build

# Verify build output
ls -la dist/
ls -la dist/public/
```

### 7. Run database migrations
```bash
# Run Drizzle migrations
npm run db:setup:prod

# This should show successful migration completion
```

### 8. Set up file directories
```bash
# Create upload directories
mkdir -p uploads/{games,thumbnails,challenge-screenshots}
mkdir -p public/images/games

# Set permissions
chmod -R 755 uploads/
chmod -R 755 public/
```

### 9. Start backend with PM2
```bash
# Start the application with PM2
pm2 start ecosystem.config.cjs

# Check PM2 status
pm2 list
pm2 logs gameschakra

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown by the command above
```

### 10. Configure Nginx
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/gameschakra.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name gameschakra.com www.gameschakra.com;

    # Serve static files (React build)
    location / {
        root /var/www/gameschakra/dist/public;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/gameschakra/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/gameschakra.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### 11. Check everything is working
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check if backend is responding
curl http://localhost:3000/api/health

# Get your EC2 public IP
curl ifconfig.me

# Check if the site loads
curl -I http://localhost/
```

### 12. Configure DNS (Do this from your domain registrar)
```bash
# Get your EC2 public IP
curl ifconfig.me

# Point these DNS records to your EC2 IP:
# A record: gameschakra.com → YOUR_EC2_IP
# A record: www.gameschakra.com → YOUR_EC2_IP
```

### 13. Set up SSL (Optional but recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com

# Test SSL renewal
sudo certbot renew --dry-run
```

## Verification Commands

After deployment, run these to verify everything works:

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status ufw

# Check logs
pm2 logs gameschakra
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/categories

# Test frontend
curl -I http://localhost/
```

## Troubleshooting

If something doesn't work:

```bash
# Check PM2 logs
pm2 logs gameschakra

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart gameschakra
sudo systemctl restart nginx

# Check database connection
npm run db:studio
```

Your GameHub Pro should now be live at `http://your-ec2-ip` and `http://gameschakra.com` (once DNS propagates)!