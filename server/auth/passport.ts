import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, accounts, type User, type Account } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Configure passport serialization
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (!user) {
      return done(null, false);
    }
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (Email + Password)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.password) {
        return done(null, false, { message: 'Please sign in with your social account' });
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return done(null, false, { message: 'Account has been blocked. Please contact support.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy - register strategy with proper error handling
try {
  if (process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET && 
      process.env.GOOGLE_CLIENT_ID !== 'temp-disabled' && 
      !process.env.GOOGLE_CLIENT_ID.includes('your-google')) {
    
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' ? 'https://gameschakra.com/api/auth/google/callback' : 'http://localhost:3000/api/auth/google/callback')
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if account already exists
        const [existingAccount] = await db
          .select()
          .from(accounts)
          .leftJoin(users, eq(accounts.userId, users.id))
          .where(and(
            eq(accounts.provider, 'google'),
            eq(accounts.providerAccountId, profile.id)
          ))
          .limit(1);

        if (existingAccount?.accounts) {
          // Check if user is blocked
          if (existingAccount.users?.isBlocked) {
            return done(null, false, { message: 'Account has been blocked. Please contact support.' });
          }
          // User already linked with this Google account
          return done(null, existingAccount.users);
        }

        // Check if user exists with same email
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'), null);
        }

        let [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser) {
          // Check if existing user is blocked
          if (existingUser.isBlocked) {
            return done(null, false, { message: 'Account has been blocked. Please contact support.' });
          }
          // Link existing user to Google account
          await db.insert(accounts).values({
            userId: existingUser.id,
            provider: 'google',
            providerAccountId: profile.id,
            accessToken,
            refreshToken,
            expiresAt: refreshToken ? new Date(Date.now() + 3600 * 1000) : null
          });
        } else {
          // Create new user and link to Google
          const [newUser] = await db.insert(users).values({
            email,
            name: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName || 'User',
            username: profile.emails[0].value.split('@')[0], // Use email prefix as username
            avatarUrl: profile.photos?.[0]?.value,
            password: null // No password for social accounts
          }).returning();

          await db.insert(accounts).values({
            userId: newUser.id,
            provider: 'google',
            providerAccountId: profile.id,
            accessToken,
            refreshToken,
            expiresAt: refreshToken ? new Date(Date.now() + 3600 * 1000) : null
          });

          existingUser = newUser;
        }

        return done(null, existingUser);
      } catch (error) {
        console.error('Google OAuth strategy error:', error);
        return done(error, null);
      }
    }
    ));
    
    console.log('✅ Google OAuth strategy registered successfully');
  } else {
    console.warn('⚠️  Google OAuth not configured - missing or invalid GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET');
  }
} catch (error) {
  console.error('❌ Failed to register Google OAuth strategy:', error);
}

// Apple OAuth Strategy
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      callbackURL: process.env.APPLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' ? 'https://gameschakra.com/api/auth/apple/callback' : '/api/auth/apple/callback'),
      scope: ['name', 'email'],
      passReqToCallback: false
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Check if account already exists
        const [existingAccount] = await db
          .select()
          .from(accounts)
          .leftJoin(users, eq(accounts.userId, users.id))
          .where(and(
            eq(accounts.provider, 'apple'),
            eq(accounts.providerAccountId, profile.id)
          ))
          .limit(1);

        if (existingAccount?.accounts) {
          // Check if user is blocked
          if (existingAccount.users?.isBlocked) {
            return done(null, false, { message: 'Account has been blocked. Please contact support.' });
          }
          return done(null, existingAccount.users);
        }

        // Check if user exists with same email
        const email = profile.email;
        if (!email) {
          return done(new Error('No email provided by Apple'), null);
        }

        let [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingUser) {
          // Check if existing user is blocked
          if (existingUser.isBlocked) {
            return done(null, false, { message: 'Account has been blocked. Please contact support.' });
          }
          // Link existing user to Apple account
          await db.insert(accounts).values({
            userId: existingUser.id,
            provider: 'apple',
            providerAccountId: profile.id,
            accessToken,
            refreshToken,
            expiresAt: refreshToken ? new Date(Date.now() + 3600 * 1000) : null
          });
        } else {
          // Create new user and link to Apple
          const [newUser] = await db.insert(users).values({
            email,
            name: profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : 'User',
            username: email.split('@')[0], // Use email prefix as username
            password: null // No password for social accounts
          }).returning();

          await db.insert(accounts).values({
            userId: newUser.id,
            provider: 'apple',
            providerAccountId: profile.id,
            accessToken,
            refreshToken,
            expiresAt: refreshToken ? new Date(Date.now() + 3600 * 1000) : null
          });

          existingUser = newUser;
        }

        return done(null, existingUser);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
}

export default passport;