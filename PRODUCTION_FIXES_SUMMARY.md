# Production Fixes Summary - GamesChakra

## 🎯 Issues Fixed

All production authentication, session, CORS, and admin dashboard issues have been resolved.

---

## ✅ Code Changes

### 1. **server/routes/auth.ts** (Authentication Routes)

#### `/api/auth/logout` - Changed from GET to POST
**Before:**
```typescript
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('gc_sid', {
      domain: '.gameschakra.com',  // ❌ Hardcoded
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
  });
});
```

**After:**
```typescript
router.post('/logout', (req, res) => {
  const sessionName = process.env.SESSION_NAME || 'gc_sid';

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }

    // ✅ Environment-based cookie config
    res.clearCookie(sessionName, {
      domain: process.env.COOKIE_DOMAIN || undefined,
      httpOnly: true,
      secure: process.env.SECURE_COOKIES === 'true',
      sameSite: (process.env.SAME_SITE_COOKIES as 'lax' | 'strict' | 'none') || 'lax'
    });

    res.status(200).json({ message: 'Logged out successfully' });
  });
});
```

#### `/api/auth/me` - Reliable Session Check
**Before:**
```typescript
router.get('/me', async (req, res) => {
  if (req.session.userId) {
    const [user] = await db.select()...
    if (user) return res.json({ user });
  }

  if (req.user) {
    return res.json({ user: req.user });
  }

  return res.json({ user: null });
});
```

**After:**
```typescript
router.get('/me', async (req, res) => {
  // ✅ Priority 1: Check session.userId (works for both local + OAuth)
  const sessionUserId = req.session?.userId;
  if (sessionUserId) {
    const [user] = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1);
    if (user) {
      console.log('/api/auth/me - found user from session.userId:', user.id);
      return res.json({ user: sanitizeUser(user) });
    }
  }

  // ✅ Priority 2: Check Passport user (OAuth fallback)
  if (req.user) {
    console.log('/api/auth/me - found user from passport:', req.user.id);
    // ✅ Sync session.userId for future requests
    req.session.userId = req.user.id;
    await save(req);
    return res.json({ user: sanitizeUser(req.user) });
  }

  return res.json({ user: null });
});
```

---

### 2. **server/index.ts** (CORS Fix)

#### Handle Same-Origin Requests (No Origin Header)
**Before:**
```typescript
if (process.env.NODE_ENV === 'production') {
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    console.log(`[CORS] Blocked origin: ${origin}`);  // ❌ Blocks undefined
  }
}
```

**After:**
```typescript
if (process.env.NODE_ENV === 'production') {
  // ✅ Handle same-origin requests (no Origin header)
  if (!origin) {
    const effectiveOrigin = allowedOrigins[0] || 'https://gameschakra.com';
    res.setHeader('Access-Control-Allow-Origin', effectiveOrigin);
    console.log(`[CORS] Same-origin request (no Origin header), using: ${effectiveOrigin}`);
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`[CORS] Allowed origin: ${origin}`);
  } else {
    console.log(`[CORS] Blocked origin: ${origin}`);
  }
}
```

---

### 3. **server/middleware/auth.ts** (Admin Middleware)

#### Check Both Session and Passport for Admin Routes
**Before:**
```typescript
export function isAdmin(req, res, next) {
  // ❌ Only checks req.isAuthenticated() (Passport)
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}
```

**After:**
```typescript
export async function isAdmin(req, res, next) {
  // ✅ Check admin token bypass first
  if (req.adminTokenAuth) {
    return next();
  }

  // ✅ Check both passport AND session.userId
  const sessionUserId = req.session?.userId;

  if (!req.isAuthenticated() && !sessionUserId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // ✅ Load user from DB if session exists but req.user is not set
  let user = req.user;
  if (!user && sessionUserId) {
    const [dbUser] = await db.select().from(users)
      .where(eq(users.id, sessionUserId)).limit(1);
    if (dbUser) {
      user = dbUser;
      req.user = dbUser;
    }
  }

  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}
```

---

## 🚀 AWS Deployment Requirements

### Required Environment Variables

Create `/opt/gc/gc/.env.production` with:

```bash
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/gameschakra?sslmode=require

# Session (CRITICAL - must be set correctly)
SESSION_SECRET=your-super-secret-random-string-change-this
SESSION_NAME=gc_sid
SECURE_COOKIES=true
SAME_SITE_COOKIES=lax
COOKIE_DOMAIN=.gameschakra.com

# CORS (must include your domain)
CORS_ORIGIN=https://gameschakra.com,https://www.gameschakra.com

# Proxy (behind Nginx)
TRUST_PROXY=true

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://gameschakra.com/api/auth/google/callback

# Admin API Token
ADMIN_TOKEN=your-secure-token-for-scripts
```

---

## 🔧 Server Configuration

### 1. Nginx (`/etc/nginx/sites-available/gameschakra`)

**Critical Headers for Session/Auth:**
```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;  # ✅ Required for trust proxy
}
```

**Static File Serving:**
```nginx
location /uploads {
    alias /opt/gc/gc/uploads;
    expires 7d;
}

location /games {
    alias /opt/gc/gc/uploads/games;
    expires 7d;
}

location /images/games {
    alias /opt/gc/gc/uploads/thumbnails;
    expires 7d;
}
```

### 2. PostgreSQL Session Table

Ensure this table exists (auto-created by `connect-pg-simple`):
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
```

### 3. PM2 Process Manager

```bash
cd /opt/gc/gc
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🧪 Verification Steps

After deploying, test these:

### 1. **Email/Password Login**
```bash
curl -X POST https://gameschakra.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  -c cookies.txt -v
```
✅ Should return `200 OK` with user object and set `gc_sid` cookie

### 2. **Check Session Persistence**
```bash
curl https://gameschakra.com/api/auth/me \
  -b cookies.txt -v
```
✅ Should return `200 OK` with user object (not null)

### 3. **Admin Dashboard Access**
```bash
curl https://gameschakra.com/api/admin/users \
  -b cookies.txt -v
```
✅ Should return `200 OK` (not 401) if logged-in user is admin

### 4. **Logout**
```bash
curl -X POST https://gameschakra.com/api/auth/logout \
  -b cookies.txt -v
```
✅ Should return `200 OK` and clear `gc_sid` cookie

### 5. **CORS Check (Browser)**
Open browser console on https://gameschakra.com:
```javascript
fetch('/api/auth/me', {credentials: 'include'})
  .then(r => r.json())
  .then(console.log)
```
✅ Should NOT show CORS errors and return user data if logged in

---

## 🐛 Common Issues & Solutions

### Issue 1: "401 Unauthorized" on Admin Dashboard
**Cause:** Session not being sent or not recognized

**Solution:**
- Check `COOKIE_DOMAIN=.gameschakra.com` (note the leading dot)
- Verify `TRUST_PROXY=true` is set
- Check Nginx passes `X-Forwarded-Proto` header
- Ensure browser is sending `gc_sid` cookie (check DevTools → Network)

### Issue 2: "CORS Blocked: undefined origin"
**Cause:** Same-origin requests don't send Origin header

**Solution:**
✅ Already fixed in `server/index.ts` - now handles undefined origin

### Issue 3: "/api/auth/me returns null" after login
**Cause:** Session not persisting or `req.user` not populated

**Solution:**
✅ Already fixed in `server/routes/auth.ts` - now checks both `session.userId` and `req.user`

### Issue 4: "404 on /api/auth/logout"
**Cause:** Old code used GET, frontend may have been using POST

**Solution:**
✅ Already changed to POST in `server/routes/auth.ts`

---

## 📦 Deployment Commands

On your EC2 instance:

```bash
# Navigate to project
cd /opt/gc/gc

# Pull latest fixes
git pull origin main

# Install dependencies
npm install

# Build project
npm run build

# Run database migrations
npm run db:push

# Restart PM2
pm2 restart gc-api

# Check logs
pm2 logs gc-api --lines 20
```

---

## ✅ What's Fixed Summary

| Issue | Status | File Changed |
|-------|--------|--------------|
| `/api/auth/logout` 404 | ✅ Fixed | `server/routes/auth.ts` |
| Logout doesn't clear cookie | ✅ Fixed | `server/routes/auth.ts` |
| CORS blocks same-origin | ✅ Fixed | `server/index.ts` |
| Admin dashboard 401 | ✅ Fixed | `server/middleware/auth.ts` |
| `/api/auth/me` returns null | ✅ Fixed | `server/routes/auth.ts` |
| Session not persisting | ✅ Fixed | `server/routes/auth.ts` |
| Trust proxy not enabled | ✅ Already Enabled | `server/index.ts:35` |
| Static files 404 | ✅ Already Working | `server/index.ts:197-206` |

---

## 📚 Documentation

Full deployment guide: **[AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)**

Includes:
- Complete environment variable reference
- Nginx configuration
- PM2 setup
- Database setup
- Troubleshooting guide
- Security checklist

---

**Deployment Date:** 2025-11-01
**Commit:** `c4ca0f8`
**Status:** ✅ Ready for Production
