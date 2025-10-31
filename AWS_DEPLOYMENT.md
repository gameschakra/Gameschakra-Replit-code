# AWS EC2 Production Deployment Guide - GamesChakra

## ✅ Code Fixes Applied

The following production issues have been fixed in the codebase:

### 1. **Authentication & Session Fixes**
- ✅ Changed `/api/auth/logout` from GET to POST with proper session destruction
- ✅ Logout now uses environment-based cookie configuration (SESSION_NAME, COOKIE_DOMAIN, SECURE_COOKIES, SAME_SITE_COOKIES)
- ✅ `/api/auth/me` now reliably checks both `req.session.userId` and `req.user` (Passport)
- ✅ Frontend already uses POST for logout

### 2. **CORS Fixes**
- ✅ Fixed CORS to handle same-origin requests (when Origin header is undefined)
- ✅ Production CORS now allows requests without Origin header by using first allowed origin as default

### 3. **Admin Dashboard Fixes**
- ✅ `isAdmin` middleware now checks both `req.session.userId` AND `req.user`
- ✅ Admin middleware loads user from database if `session.userId` exists but `req.user` is not populated
- ✅ Admin token authentication (`X-Admin-Token` header) properly bypasses session check

### 4. **Infrastructure**
- ✅ Trust proxy already enabled (`app.set('trust proxy', 1)`)
- ✅ Static file serving paths verified (uploads/thumbnails, uploads/games)

---

## 🔧 Required Environment Variables (.env.production)

Create or update `/opt/gc/gc/.env.production` with the following:

```bash
# Node Environment
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database (RDS PostgreSQL or Neon)
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/gameschakra?sslmode=require

# Session Configuration
SESSION_SECRET=your-super-secret-random-string-change-this
SESSION_NAME=gc_sid
SECURE_COOKIES=true
SAME_SITE_COOKIES=lax
COOKIE_DOMAIN=.gameschakra.com

# CORS Configuration
CORS_ORIGIN=https://gameschakra.com,https://www.gameschakra.com

# Proxy Configuration (behind Nginx)
TRUST_PROXY=true

# Google OAuth (Required for Google Login)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://gameschakra.com/api/auth/google/callback

# Apple OAuth (Optional)
# APPLE_CLIENT_ID=com.gameschakra.service
# APPLE_TEAM_ID=your-team-id
# APPLE_KEY_ID=your-key-id
# APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
# APPLE_CALLBACK_URL=https://gameschakra.com/api/auth/apple/callback

# Admin Access (for API scripts/tools)
ADMIN_TOKEN=your-secure-admin-api-token-here

# File Upload Configuration
BODY_PARSER_LIMIT=50mb
REQUEST_TIMEOUT=300000

# Optional: Analytics & Logging
TZ=UTC
```

---

## 🗄️ AWS RDS / Neon PostgreSQL Setup

### Required Database Extensions & Tables

Your PostgreSQL database must have:

1. **Session Store Table** (automatically created by `connect-pg-simple`):
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

2. **Application Tables** (from your schema):
   - `users` (id, email, password, name, username, phone, city, country, isAdmin, isBlocked, avatarUrl, createdAt, updatedAt)
   - `accounts` (OAuth account linking)
   - `games`, `categories`, `favorites`, `recently_played`, `challenges`, etc.

Run your Drizzle migration:
```bash
cd /opt/gc/gc
npm run db:push
# OR
npx drizzle-kit push:pg
```

---

## 🌐 Nginx Configuration

Update your Nginx config (`/etc/nginx/sites-available/gameschakra` or similar):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name gameschakra.com www.gameschakra.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name gameschakra.com www.gameschakra.com;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/gameschakra.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gameschakra.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size for file uploads (50MB)
    client_max_body_size 50M;

    # Proxy API requests to Node.js backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for large uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Serve uploaded files (games and thumbnails)
    location /uploads {
        alias /opt/gc/gc/uploads;
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    location /games {
        alias /opt/gc/gc/uploads/games;
        expires 7d;
        add_header Cross-Origin-Opener-Policy "same-origin";
    }

    location /images/games {
        alias /opt/gc/gc/uploads/thumbnails;
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # Serve static frontend build
    location / {
        root /opt/gc/gc/dist/public;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Special handling for sitemap, robots.txt, ads.txt
    location = /sitemap.xml {
        proxy_pass http://localhost:5000/sitemap.xml;
        proxy_set_header Host $host;
    }

    location = /robots.txt {
        root /opt/gc/gc/public;
    }

    location = /ads.txt {
        root /opt/gc/gc/public;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 PM2 Process Manager Setup

### Create PM2 Ecosystem File

Create `/opt/gc/gc/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'gc-api',
    script: 'dist/index.js',
    cwd: '/opt/gc/gc',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '/opt/gc/gc/.env.production',
    max_memory_restart: '1G',
    error_file: '/var/log/gc/error.log',
    out_file: '/var/log/gc/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### Start/Restart PM2

```bash
cd /opt/gc/gc
pm2 start ecosystem.config.js
# OR to restart
pm2 restart gc-api
pm2 save
pm2 startup  # Enable on boot
```

---

## 🚀 Deployment Script

Create a deployment script `/opt/gc/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

cd /opt/gc/gc

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build the project
echo "🔨 Building project..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:push

# Restart PM2 service
echo "🔄 Restarting PM2 service..."
pm2 restart gc-api

# Check logs
echo "📋 Checking service logs..."
pm2 logs gc-api --lines 20 --nostream

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x /opt/gc/deploy.sh
```

---

## 🔍 Troubleshooting

### Check Service Status
```bash
pm2 status
pm2 logs gc-api --lines 50
sudo journalctl -u nginx -n 50
```

### Check Database Connection
```bash
cd /opt/gc/gc
node -e "require('dotenv').config({path:'.env.production'}); const {db} = require('./dist/db'); db.select().from(require('./dist/schema').users).limit(1).then(r=>console.log('✅ DB OK',r)).catch(e=>console.error('❌ DB Error',e));"
```

### Test API Endpoints
```bash
# Health check
curl https://gameschakra.com/api/health

# Auth check
curl -v https://gameschakra.com/api/auth/me

# Test logout
curl -X POST https://gameschakra.com/api/auth/logout \
  -H "Cookie: gc_sid=your-session-cookie" \
  -H "Content-Type: application/json"
```

### Common Issues

1. **401 Unauthorized on Dashboard**
   - Check session cookie is being sent (`gc_sid`)
   - Verify `COOKIE_DOMAIN=.gameschakra.com`
   - Ensure `TRUST_PROXY=true` and Nginx passes `X-Forwarded-*` headers

2. **CORS Errors**
   - Verify `CORS_ORIGIN=https://gameschakra.com,https://www.gameschakra.com`
   - Check browser console for blocked origins
   - Ensure Nginx passes `Host` header correctly

3. **Session Not Persisting**
   - Check PostgreSQL session table exists
   - Verify `DATABASE_URL` is correct and accessible
   - Ensure `SESSION_SECRET` is set and not the default

4. **Google OAuth Not Working**
   - Verify `GOOGLE_CALLBACK_URL=https://gameschakra.com/api/auth/google/callback`
   - Add authorized redirect URI in Google Cloud Console
   - Check Google OAuth credentials are valid

---

## 📊 Monitoring & Logs

### View Real-time Logs
```bash
pm2 logs gc-api --lines 100 --timestamp
```

### Monitor Performance
```bash
pm2 monit
```

### Setup PM2 Web Dashboard (Optional)
```bash
pm2 install pm2-server-monit
```

---

## 🔐 Security Checklist

- [ ] `SESSION_SECRET` is a strong random string (not default)
- [ ] `SECURE_COOKIES=true` for HTTPS
- [ ] `SAME_SITE_COOKIES=lax` to prevent CSRF
- [ ] `COOKIE_DOMAIN=.gameschakra.com` for subdomain support
- [ ] SSL certificate is valid (Let's Encrypt auto-renewal)
- [ ] Database uses SSL connection (`sslmode=require`)
- [ ] Admin token is strong and secret
- [ ] File upload limits enforced (50MB)
- [ ] Nginx security headers configured
- [ ] PostgreSQL firewall only allows EC2 IP

---

## ✅ Final Verification

After deployment, verify these work:

1. ✅ Login with email/password → Dashboard accessible
2. ✅ Login with Google OAuth → Dashboard accessible
3. ✅ Logout clears session and cookie
4. ✅ Admin routes return 200 (not 401)
5. ✅ Games load and play correctly
6. ✅ Thumbnails display properly
7. ✅ Session persists across page refreshes
8. ✅ No CORS errors in browser console

---

## 📞 Support

If issues persist after following this guide:
1. Check PM2 logs: `pm2 logs gc-api --lines 100`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

**Last Updated:** 2025-11-01
