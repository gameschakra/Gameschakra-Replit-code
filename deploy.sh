#!/bin/bash

# GameSchakra Production Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting GameSchakra Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="gameschakra"
APP_DIR="/var/www/gameschakra"
NGINX_CONF="/etc/nginx/sites-available/gameschakra.com"
LOG_DIR="/var/log/gameschakra"
DOMAIN="gameschakra.com"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Install with: npm install -g pm2"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Create directories
echo "📁 Creating directories..."
sudo mkdir -p $LOG_DIR
sudo mkdir -p $APP_DIR/uploads/{games,thumbnails,challenge-screenshots}
sudo chown -R $USER:$USER $LOG_DIR
sudo chown -R $USER:$USER $APP_DIR
print_status "Directories created"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false
print_status "Dependencies installed"

# Generate database migrations
echo "🗃️ Generating database migrations..."
npm run db:generate
print_status "Database migrations generated"

# Build application
echo "🏗️ Building application..."
npm run clean
npm run build
print_status "Application built successfully"

# Run database migrations
echo "🗃️ Running database migrations..."
npm run db:migrate
print_status "Database migrations completed"

# Create admin user
echo "👤 Creating admin user..."
npx tsx scripts/create-admin.ts
print_status "Admin user setup completed"

# Setup Nginx configuration
echo "🌐 Setting up Nginx configuration..."
if [ ! -f "$NGINX_CONF" ]; then
    sudo cp nginx.conf $NGINX_CONF
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
        print_status "Nginx configuration installed"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
else
    print_warning "Nginx configuration already exists"
fi

# Setup SSL with Certbot (if not already configured)
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "🔒 Setting up SSL certificate..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    print_status "SSL certificate configured"
else
    print_warning "SSL certificate already exists"
fi

# Start/Restart PM2 application
echo "🚀 Starting application with PM2..."
if pm2 list | grep -q $APP_NAME; then
    pm2 restart $APP_NAME
    print_status "Application restarted"
else
    pm2 start ecosystem.config.cjs
    print_status "Application started"
fi

# Save PM2 configuration
pm2 save
print_status "PM2 configuration saved"

# Setup PM2 startup script
if ! pm2 startup | grep -q "already"; then
    print_warning "Please run the PM2 startup command shown above as root"
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -s reload
print_status "Nginx reloaded"

# Final health check
echo "🏥 Performing health check..."
sleep 5
if curl -f -s http://localhost:5000/api/health > /dev/null; then
    print_status "Health check passed"
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Application Status:"
    pm2 list
    echo ""
    echo "🌐 Your application is available at:"
    echo "   https://$DOMAIN"
    echo ""
    echo "📝 Useful commands:"
    echo "   pm2 logs $APP_NAME    # View application logs"
    echo "   pm2 restart $APP_NAME # Restart application"
    echo "   pm2 stop $APP_NAME    # Stop application"
    echo "   nginx -s reload       # Reload Nginx"
    echo ""
else
    print_error "Health check failed - application may not be running correctly"
    echo "Check logs with: pm2 logs $APP_NAME"
    exit 1
fi