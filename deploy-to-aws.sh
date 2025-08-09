#!/bin/bash

# GameHub Pro AWS EC2 Deployment Script
# Run this script on your Ubuntu EC2 instance

set -e  # Exit on any error

echo "🚀 Starting GameHub Pro deployment to AWS EC2..."

# Step 1: Update system and install dependencies
echo "📦 Installing system dependencies..."
sudo apt update
sudo apt install -y git nodejs npm nginx certbot python3-certbot-nginx

# Install PM2 globally
sudo npm install -g pm2

# Step 2: Clone or update repository
echo "📥 Pulling latest code from repository..."
if [ -d "/var/www/gameschakra" ]; then
    echo "Directory exists, pulling latest changes..."
    cd /var/www/gameschakra
    git pull origin main
else
    echo "Cloning repository..."
    sudo mkdir -p /var/www
    cd /var/www
    sudo git clone https://github.com/gameschakra/Gameschakra-Replit-code.git gameschakra
    sudo chown -R $USER:$USER /var/www/gameschakra
    cd /var/www/gameschakra
fi

# Step 3: Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 4: Set up environment variables
echo "🔧 Setting up environment variables..."
if [ -f ".env.production.aws" ]; then
    echo "Using existing .env.production.aws template..."
    cp .env.production.aws .env.production
else
    echo "Creating new .env.production..."
    cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=3000

# AWS RDS PostgreSQL Connection
DATABASE_URL=postgresql://postgres:Vipyad96!@beta-rds.ct0qaymyqs9f.ap-south-1.rds.amazonaws.com:5432/gameschakra

# Session Security
SESSION_SECRET=$(openssl rand -base64 32)

# CORS Configuration for Production
CORS_ORIGIN=https://gameschakra.com,https://www.gameschakra.com,http://gameschakra.com,http://www.gameschakra.com

# Database Connection Pool
MAX_CONNECTIONS=20

# File Upload Settings
MAX_FILE_SIZE=50000000

# Logging
LOG_LEVEL=info

# Cookie domain for production
COOKIE_DOMAIN=gameschakra.com

# SSL/Security
SECURE_COOKIES=false

# Performance Settings
REQUEST_TIMEOUT=300000
UPLOAD_TIMEOUT=600000

# AWS/Production Specific
TRUST_PROXY=true
EOF
fi

# Generate secure session secret if it's still the default
if grep -q "CHANGE_THIS_IN_PRODUCTION" .env.production; then
    SECURE_SECRET=$(openssl rand -base64 32)
    sed -i "s/CHANGE_THIS_IN_PRODUCTION_USE_openssl_rand_base64_32/$SECURE_SECRET/" .env.production
    echo "✅ Generated secure session secret"
fi

echo "✅ Environment file created with secure session secret"

# Step 5: Build the application
echo "🔨 Building the application..."
npm run build

# Step 6: Set up database
echo "🗄️  Setting up database with Drizzle migrations..."
npm run db:setup:prod

# Step 7: Set up directories and permissions
echo "📁 Setting up directories and permissions..."
sudo mkdir -p /var/www/gameschakra/uploads/{games,thumbnails,challenge-screenshots}
sudo mkdir -p /var/www/gameschakra/public/images/games
sudo chown -R $USER:$USER /var/www/gameschakra/uploads
sudo chown -R $USER:$USER /var/www/gameschakra/public
chmod -R 755 /var/www/gameschakra/uploads
chmod -R 755 /var/www/gameschakra/public

# Step 8: Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/gameschakra.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name gameschakra.com www.gameschakra.com;

    # Serve static files
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
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/gameschakra.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Step 9: Start services
echo "🚀 Starting services..."

# Start backend with PM2
pm2 delete gameschakra || true  # Delete existing process if any
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Reload Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx

# Step 10: Display status
echo "✅ Deployment completed!"
echo ""
echo "📊 Service Status:"
pm2 list
sudo systemctl status nginx --no-pager -l

echo ""
echo "🌐 Your application should now be accessible at:"
echo "   http://$(curl -s ifconfig.me)"
echo "   http://gameschakra.com (once DNS is configured)"
echo ""
echo "📝 Next steps:"
echo "1. Point your domain gameschakra.com to this EC2 IP: $(curl -s ifconfig.me)"
echo "2. Set up SSL with: sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com"
echo "3. Monitor logs with: pm2 logs gameschakra"
echo "4. Check Nginx logs with: sudo tail -f /var/log/nginx/error.log"

echo "🎉 GameHub Pro is now live!"