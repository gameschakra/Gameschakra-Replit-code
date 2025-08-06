#!/bin/bash

# Quick Production Deployment Script for GameSchakra
# This matches your exact requirements

echo "🚀 GameSchakra Production Deployment"

# Step 1: Setup Nginx
echo "1. Setting up Nginx configuration..."
sudo cp nginx-gameschakra.conf /etc/nginx/sites-available/gameschakra
sudo ln -s /etc/nginx/sites-available/gameschakra /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx configured"

# Step 2: HTTPS with Let's Encrypt
echo "2. Setting up HTTPS..."
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d gameschakra.com -d www.gameschakra.com
echo "✅ HTTPS configured"

# Step 3: Create logs directory
echo "3. Creating logs directory..."
mkdir -p logs
echo "✅ Logs directory created"

# Step 4: Build and run app
echo "4. Building and starting application..."
cd server 
pnpm build 
pm2 start ecosystem.config.js

echo "✅ Application started with PM2"

# Save PM2 config
pm2 save
echo "✅ PM2 configuration saved"

echo ""
echo "🎉 Deployment completed!"
echo "🌐 Visit: https://gameschakra.com"
echo "📊 Check status: pm2 list"
echo "📝 View logs: pm2 logs gameschakra-backend"