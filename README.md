# CrazyGames.com Clone

A comprehensive HTML5 game platform that enables game developers to upload, showcase, and share their creative gaming projects, with enhanced social and discovery features.

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn/UI components
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with express-session
- **Form Validation**: Zod
- **State Management**: React Query

## Features

- Game upload and processing system
- Category management
- Game discovery (featured, popular, trending)
- Game play tracking
- User favorites system
- Recently played games
- Search functionality
- Responsive design (mobile, tablet, desktop)
- Admin dashboard for content management

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Push database schema changes
npm run db:push
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and schemas
- `/uploads` - Game and thumbnail storage

## License

MIT