#!/bin/bash

# GameSchakra Production Deployment Commands
# Run these commands on your EC2 instance

echo "🚀 Starting GameSchakra Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Setup Nginx Configuration
echo "🌐 Setting up Nginx configuration..."
sudo cp nginx-gameschakra.conf /etc/nginx/sites-available/gameschakra
sudo ln -sf /etc/nginx/sites-available/gameschakra /etc/nginx/sites-enabled/

# Test Nginx configuration
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
    sudo systemctl reload nginx
    print_status "Nginx reloaded successfully"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 2: Install Certbot and setup HTTPS
echo "🔒 Setting up Let's Encrypt SSL..."
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
print_warning "About to request SSL certificate for gameschakra.com and www.gameschakra.com"
print_warning "Make sure your domain DNS is pointing to this server before proceeding!"
read -p "Press Enter to continue or Ctrl+C to abort..."

sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com

if [ $? -eq 0 ]; then
    print_status "SSL certificate installed successfully"
else
    print_error "SSL certificate installation failed"
    exit 1
fi

# Step 3: Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
print_status "Logs directory created"

# Step 4: Install dependencies and build
echo "📦 Installing dependencies and building app..."
npm ci
npm run build

if [ $? -eq 0 ]; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 5: Run database migrations
echo "🗃️ Running database migrations..."
npm run db:migrate

if [ $? -eq 0 ]; then
    print_status "Database migrations completed"
else
    print_error "Database migrations failed"
    exit 1
fi

# Step 6: Create admin user
echo "👤 Creating admin user..."
npx tsx scripts/create-admin.ts
print_status "Admin user setup completed"

# Step 7: Start application with PM2
echo "🚀 Starting application with PM2..."
cd server

# Stop if already running
pm2 stop gameschakra-backend 2>/dev/null || true

# Start with ecosystem config
pm2 start ecosystem.config.js

if [ $? -eq 0 ]; then
    print_status "Application started successfully with PM2"
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup (run the command it outputs)
    pm2 startup | tail -1 | sudo bash
    
    print_status "PM2 startup configured"
else
    print_error "Failed to start application with PM2"
    exit 1
fi

# Step 8: Final verification
echo "🏥 Performing health checks..."
sleep 5

# Check if PM2 app is running
if pm2 list | grep -q "gameschakra-backend.*online"; then
    print_status "PM2 application is running"
else
    print_error "PM2 application is not running"
    pm2 logs gameschakra-backend
    exit 1
fi

# Check if API is responding
if curl -f -s http://localhost:5000/api/health > /dev/null; then
    print_status "Backend health check passed"
else
    print_error "Backend health check failed"
    pm2 logs gameschakra-backend
    exit 1
fi

# Check HTTPS
if curl -f -s https://gameschakra.com > /dev/null; then
    print_status "HTTPS check passed"
else
    print_warning "HTTPS check failed - may need DNS propagation time"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 list
echo ""
echo "🌐 Your application should be available at:"
echo "   https://gameschakra.com"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs gameschakra-backend    # View application logs"
echo "   pm2 restart gameschakra-backend # Restart application"
echo "   pm2 stop gameschakra-backend    # Stop application"
echo "   sudo nginx -s reload            # Reload Nginx"
echo "   sudo systemctl status nginx     # Check Nginx status"
echo ""
print_status "Deployment script completed successfully!"