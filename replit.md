# CrazyGames.com Clone - Game Platform

## Overview

This is a comprehensive HTML5 game platform built to replicate the functionality and user experience of CrazyGames.com. The application enables game developers to upload, showcase, and share their gaming projects while providing users with an enhanced gaming and discovery experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

**Frontend**: React with TypeScript, styled using Tailwind CSS and Shadcn/UI components for a modern, responsive interface
**Backend**: Express.js server with TypeScript for type safety and robust API endpoints
**Database**: PostgreSQL with Drizzle ORM for type-safe database operations
**Authentication**: Passport.js with express-session for secure user management
**File Processing**: Multer for file uploads with ZIP extraction capabilities for game files

## Key Components

### Frontend Architecture
- **Component Structure**: Modular React components organized by feature (layout, admin, games, auth)
- **State Management**: React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom theme configuration and Shadcn/UI component library
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Architecture
- **API Structure**: RESTful APIs organized by feature domains (auth, games, admin, analytics)
- **Middleware Stack**: Express with CORS, session management, and authentication middleware
- **File Processing**: ZIP file extraction, thumbnail generation, and static file serving
- **Error Handling**: Comprehensive error handling with detailed logging

### Database Schema
- **Users**: Authentication and profile management with admin roles
- **Games**: Complete game metadata with categories, thumbnails, and play statistics
- **Categories**: Hierarchical game organization system
- **Analytics**: Play tracking, device detection, and traffic source analytics
- **Blog System**: Content management with posts, categories, and tags
- **Challenges**: Gaming competitions with submissions and leaderboards

## Data Flow

1. **Game Upload Process**:
   - User uploads ZIP file containing HTML5 game
   - Server extracts and validates game files
   - Thumbnail processing and storage
   - Database record creation with metadata
   - Static file serving configuration

2. **Game Discovery**:
   - Category-based browsing
   - Search functionality across titles and descriptions
   - Featured games system
   - Analytics-driven recommendations

3. **User Interaction**:
   - Session-based authentication
   - Play count tracking
   - Favorites and recently played systems
   - Admin dashboard for content management

## External Dependencies

- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **File Storage**: Local filesystem for game files and thumbnails
- **Image Processing**: Sharp for thumbnail generation and optimization
- **ZIP Processing**: extract-zip and adm-zip for game file handling
- **Analytics**: Google AdSense integration with custom analytics tracking
- **SEO**: Dynamic sitemap generation and meta tag management

## Deployment Strategy

The application is configured for deployment on Replit with the following considerations:

- **Environment Variables**: Database connection via DATABASE_URL
- **Static Assets**: Served from public directory with proper caching headers
- **File Uploads**: Persistent storage in uploads directory
- **Session Management**: Configured for proxy environments with secure cookie handling
- **CORS**: Dynamic origin handling for development and production environments

The build process uses Vite for frontend bundling and esbuild for backend compilation, optimized for both development and production environments.