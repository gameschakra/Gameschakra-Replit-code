# Localhost Development Testing Guide

This project is now configured to work seamlessly on both localhost (development) and production environments.

## Quick Start for Localhost Testing

### 1. Environment Setup
Your `.env` file is already configured for development:
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:Vipyad96!@beta-rds.ct0qaymyqs9f.ap-south-1.rds.amazonaws.com:5432/gameschakra
SESSION_SECRET=your-secret-key-change-this-in-production
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access the Application
- **Frontend**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin

### 4. Testing Dashboard Functionality

#### Admin Login
1. Go to http://localhost:5000/login
2. Use your admin credentials
3. Navigate to http://localhost:5000/admin

#### Dashboard Features to Test
- **Games Tab**: Upload, edit, publish/unpublish games
- **Categories Tab**: Create, manage categories
- **Challenges Tab**: Create, manage challenges  
- **Blog Tab**: Blog post management
- **Analytics Tab**: View charts and statistics

### 5. Development Features Enabled

#### Enhanced Error Logging
- All errors are logged to browser console with full details
- Error boundaries show user-friendly messages
- Retry functionality for failed components

#### API Call Debugging
- All API calls are logged with detailed information
- Request/response logging in browser console
- Environment detection logging

#### Development-Friendly Settings
- **CORS**: Permissive for localhost testing
- **Cookies**: Longer expiration (7 days) for easier testing
- **Sessions**: Development-optimized settings
- **Error Messages**: Detailed for debugging

### 6. Common Testing Scenarios

#### Test Dashboard Widgets
1. Open admin dashboard
2. Check that all tabs load without errors
3. Verify error boundaries work by simulating network issues
4. Test form submissions and API interactions

#### Test Authentication
1. Login/logout functionality
2. Session persistence across browser refreshes
3. Admin access control

#### Test API Endpoints
1. Open browser developer tools
2. Watch Network tab for API calls
3. Verify all responses have `Content-Type: application/json`
4. Check that error responses are properly formatted

### 7. Debugging Tips

#### Check Browser Console
- Look for `[API Call]` and `[Query]` logs
- Error boundary errors are grouped for easy reading
- CORS and session logs help debug auth issues

#### Network Tab
- All API calls should return proper JSON
- Check for 401/403 errors if authentication fails
- Verify CORS headers are present

#### Common Issues & Solutions

**Problem**: Dashboard not loading
- **Check**: Browser console for JavaScript errors
- **Solution**: Clear browser cache and localStorage

**Problem**: API calls failing
- **Check**: Network tab in developer tools
- **Solution**: Ensure server is running on port 5000

**Problem**: Authentication not working
- **Check**: Cookies in browser dev tools
- **Solution**: Clear cookies and try login again

### 8. Production Differences

The following settings automatically change in production:
- **CORS**: Strict origin checking (requires CORS_ORIGIN env var)
- **Cookies**: Secure flag enabled, shorter expiration
- **Sessions**: Production-optimized security settings
- **Error Logging**: Reduced detail for security

### 9. Quick Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Database operations
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open database studio
```

### 10. Environment Variables for Testing

If you need to test with different settings, you can override in `.env`:

```bash
# Enable more detailed logging
LOG_LEVEL=debug

# Test with production-like CORS (optional)
# CORS_ORIGIN=http://localhost:5000

# Custom session settings (optional)
# SESSION_SECRET=my-test-secret-key
```

## Troubleshooting

### Dashboard Won't Load
1. Check if server is running: `npm run dev`
2. Verify database connection in server logs
3. Clear browser cache and cookies
4. Check browser console for errors

### API Errors
1. Check server logs for backend errors
2. Verify database connectivity
3. Ensure all required tables exist: `npm run db:push`
4. Check if user has admin privileges

### Authentication Issues
1. Clear browser cookies
2. Check session configuration in server logs
3. Verify user credentials in database
4. Try creating a new admin user: `npm run db:studio`

## Ready for Production

When you're ready to deploy:
1. Set `NODE_ENV=production`
2. Configure `CORS_ORIGIN` with your domain
3. Change `SESSION_SECRET` to a secure value
4. Set `COOKIE_DOMAIN` for your production domain

All localhost testing fixes are automatically production-compatible!