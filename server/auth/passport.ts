import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from 'passport-apple';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, accounts, type User, type Account } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { log, warn, error } from '../logger';

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
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  warn('Google OAuth disabled: missing env');
} else {
  try {
    
    passport.use(new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
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
        error('Google OAuth strategy error:', error);
        return done(error, null);
      }
    }
    ));
    
    log('✅ Google OAuth strategy registered successfully');
  } catch (err) {
    error('❌ Failed to register Google OAuth strategy:', err);
  }
}

// Apple OAuth Strategy
const { APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CALLBACK_URL } = process.env;
if (!APPLE_CLIENT_ID || !APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
  warn('Apple OAuth disabled: missing env');
} else {
  passport.use(new AppleStrategy(
    {
      clientID: APPLE_CLIENT_ID,
      teamID: APPLE_TEAM_ID,
      keyID: APPLE_KEY_ID,
      privateKeyString: APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      callbackURL: APPLE_CALLBACK_URL || '/api/auth/apple/callback',
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
  log('✅ Apple OAuth strategy registered successfully');
}

export default passport;