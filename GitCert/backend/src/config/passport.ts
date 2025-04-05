import passport from 'passport';
import { Profile, Strategy as GitHubStrategy,} from 'passport-github2';
import { logger } from '../utils/logger';

interface GitHubUser extends Express.User {
    id: string;
    displayName?: string;
    username?: string;
    profileUrl?: string;
    photos?: Array<{value: string}>;
    emails?: Array<{value: string}>;
    provider: string;
  }
// Environment variables for GitHub OAuth
const {
  GITHUB_CLIENT_ID = 'Ov23liGOLLaOqcAE21J5',
  GITHUB_CLIENT_SECRET = '', // Enter github client secret
  GITHUB_CALLBACK_URL = 'http://localhost:3002/auth/github/callback'
} = process.env;

/**
 * Configure Passport with GitHub strategy
 */
export function configurePassport(): void {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    logger.error('GitHub OAuth credentials missing! Auth will not work properly.');
  }

  // Configure GitHub strategy
  passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL,
    scope: ['user:email']
  }, 
  async (accessToken: string, refreshToken: string, profile: Profile, done: (error: Error | null, user?: any) => void) => {
    try {
      logger.info(`GitHub authentication for user: ${profile.username} (${profile.id})`);
      
      // Just pass the GitHub profile directly - no DB storage
      return done(null, profile);
    } catch (error) {
      logger.error('Error in GitHub authentication:', error);
      return done(error as Error);
    }
  }));

  // Serialize the entire profile to the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize - just returns the profile object
  passport.deserializeUser((obj, done) => {
    done(null, obj as GitHubUser);
  });
  
  logger.info('Passport configured with GitHub strategy');
}
