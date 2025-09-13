# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Project name: "GameHub Pro" or any name you want

## Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API" and enable it
3. Search for "Google Identity" and enable it

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth 2.0 Client IDs**
3. If prompted, configure OAuth consent screen:
   - Application name: "GameHub Pro"
   - User support email: your email
   - Scopes: email, profile, openid
4. Application type: **Web application**
5. Name: "GameHub Pro Web Client"

## Step 4: Configure URLs

**For Development:**
- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`

**For Production:**
- Authorized JavaScript origins: `https://gameschakra.com`  
- Authorized redirect URIs: `https://gameschakra.com/api/auth/google/callback`

## Step 5: Copy Credentials

1. Copy **Client ID** (looks like: `123456789012-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com`)
2. Copy **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 6: Update .env File

```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret
```

## Step 7: Test

1. Restart server: `npm run dev`
2. Click "Sign in with Google"
3. Should redirect to Google OAuth → consent → login → redirect back

## Expected Flow

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. User approves (automatically if already logged into Gmail)
4. Google redirects back with code
5. Server exchanges code for user info
6. Creates account with email prefix as username
7. Logs user in and redirects to homepage

Example: 
- Gmail: `john.doe@gmail.com`
- Username created: `john.doe`
- Name: from Google profile