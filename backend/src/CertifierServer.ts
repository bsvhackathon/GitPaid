import { WalletInterface } from '@bsv/sdk';
import express, { Request, Response, NextFunction, Application, RequestHandler } from 'express';
import { AuthRequest, createAuthMiddleware } from '@bsv/auth-express-middleware';
import { createPaymentMiddleware } from '@bsv/payment-express-middleware';
import * as routes from './routes';
import passport from 'passport';
import session from 'express-session';
import path from 'path';
import { configurePassport } from './config/passport';
import { logger } from './utils/logger';
import cors from 'cors';

// Environment variables
const {
  NODE_ENV = 'development',
  SESSION_SECRET = 'your-session-secret',
  FRONTEND_URL = 'http://localhost:5173' // Default to Vite's default port
} = process.env;

// Add token storage for GitHub profiles
export const githubTokens = new Map<string, any>();

export interface CertifierServerOptions {
  port: number;
  wallet: WalletInterface;
  monetize: boolean;
  calculateRequestPrice?: (req: Request) => number | Promise<number>;
}

export interface CertifierRoute {
  type: 'post' | 'get';
  path: string;
  summary: string;
  parameters?: object;
  exampleBody?: object;
  exampleResponse: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (req: Request, res: Response, server: CertifierServer) => Promise<any>;
}

export class CertifierServer {
  private readonly app: express.Application = express();
  private readonly port: number;
  wallet: WalletInterface;
  private readonly monetize: boolean;
  private readonly calculateRequestPrice?: (req: Request) => number | Promise<number>;

  constructor(storage: any, options: CertifierServerOptions) {
    this.port = options.port;
    this.wallet = options.wallet;
    this.monetize = options.monetize;
    this.calculateRequestPrice = options.calculateRequestPrice;

    // Set up Express server
    this.setupPassport();
    this.setupRoutes();
    
    logger.info(`GitCert server initialized with port ${this.port}`);
  }

  private setupPassport(): void {
    // Configure passport with GitHub strategy
    configurePassport();
  }

  private setupRoutes(): void {
    this.app.use(express.json({ limit: '30mb' }));
    
    // Serve static files from the public directory
    this.app.use(express.static(path.join(__dirname, '../public')));

    
    // CORS configuration - use a single consistent approach
    this.app.use(cors({
      origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:1420', // Add your frontend URL
          'http://127.0.0.1:1420'
        ];
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      // Add all BSV SDK headers here
      allowedHeaders: [
        'Content-Type', 
        'Authorization',
        'x-bsv-auth-version',
        'x-bsv-auth-message-type',
        'x-bsv-auth-identity-key',
        'x-bsv-auth-nonce',
        'x-bsv-auth-your-nonce',
        'x-bsv-auth-signature',
        'x-bsv-auth-requested-certificates',
        '*'
      ],
      exposedHeaders: [
        'x-bsv-auth-version',
        'x-bsv-auth-message-type',
        'x-bsv-auth-identity-key',
        'x-bsv-auth-nonce',
        'x-bsv-auth-your-nonce',
        'x-bsv-auth-signature',
        'x-bsv-auth-requested-certificates',
        '*'
      ]
    })); 

    // Set up session middleware
    this.app.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax', // Important for cross-site requests
        httpOnly: true,
      }
    }));

    // Initialize passport
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // GitHub Auth Routes
    this.app.get('/auth/github',
      passport.authenticate('github', { scope: ['user:email'] }));

    this.app.get('/auth/github/callback',
      passport.authenticate('github', { failureRedirect: '/' }),
      (req, res) => {
        // Successful authentication, redirect to home page
        logger.info(`GitHub authentication successful for user: ${(req.user as any)?.username}`);
        res.redirect(NODE_ENV === 'production'
          ? '/'
          : FRONTEND_URL); 
      });

    // Logout route
    this.app.get('/logout', (req, res, next) => {
      const username = (req.user as any)?.username;
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        logger.info(`User logged out: ${username || 'Unknown user'}`);
        res.redirect(FRONTEND_URL);
      });
    });

    // Add the API endpoint to generate a GitHub auth token
    this.app.get('/api/auth-token', (req, res) => {
      if (!req.isAuthenticated()) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }
      
      // Generate a simple token
      const token = Math.random().toString(36).substring(2, 15);
      
      // Store the GitHub profile with the token (with 5-minute expiration)
      logger.info('THE TOKEN IS:', token)
      githubTokens.set(token, {
        profile: req.user,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      });
      
      // Return the token to the client
      logger.info(`Auth token generated for user: ${(req.user as any)?.username}`);
      res.json({ token });
    });

    // Configure the auth middleware for BSV-specific endpoints
    this.app.use(createAuthMiddleware({
      wallet: this.wallet,
      allowUnauthenticated: true,
      logger: console,
      logLevel: 'debug'
    }));

    // Setup payment middleware if enabled
    if (this.monetize) {
      this.app.use(
        createPaymentMiddleware({
          wallet: this.wallet,
          calculateRequestPrice: async (req) => {
            return 0; // Default price if no calculator is provided
          }
        })
      );
    }

    const theRoutes: CertifierRoute[] = [
      routes.signCertificate,
    ];
    
    // Set up certificate issuance route
    for (const route of theRoutes) {
      this.app[route.type](route.path, async (req: AuthRequest, res: Response) => {
        try {
          await route.func(req, res, this);
        } catch (error) {
          logger.error(`Error in route ${route.path}:`, error);
          res.status(500).json({ 
            error: 'Server error', 
            message: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      });
    }

    this.app.get('/api/user-info', (req, res) => {
      logger.debug("User authentication status:", req.isAuthenticated());
      logger.debug("User object:", req.user);
      
      if (req.isAuthenticated() && req.user) {
        // Return user data as JSON
        res.json({
          authenticated: true,
          username: (req.user as any).username,
          displayName: (req.user as any).displayName,
          email: (req.user as any).emails && (req.user as any).emails.length > 0
            ? (req.user as any).emails[0].value
            : null,
          avatarUrl: (req.user as any).photos && (req.user as any).photos.length > 0
            ? (req.user as any).photos[0].value
            : null
        });
      } else {
        // User is not authenticated - FIXED to return false
        res.status(401).json({ authenticated: false });
      }
    });

    // API endpoint to get the server's public key
    this.app.get('/api/server-info', async (req, res) => {
      try {
        const publicKey = (await this.wallet.getPublicKey({ identityKey: true})).publicKey.toString();
        res.json({
          publicKey,
          status: 'active'
        });
      } catch (error) {
        logger.error('Error fetching server info:', error);
        res.status(500).json({ error: 'Failed to retrieve server information' });
      }
    });

    // Serve the home page 
    this.app.get('/', (req, res) => {
      if (NODE_ENV === 'production') {
        // In production, serve the built React app
        res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
      } else {
        // In development, redirect to React dev server
        res.redirect(FRONTEND_URL);
      }
    });
    
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found', path: req.path });
    });
    
    // Error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`GitCert server running at http://localhost:${this.port}`);
    });
  }

  /**
   * Helper function which checks the arguments for the certificate signing request
   * @param {object} args
   * @throws {Error} if any of the required arguments are missing
   */
  certifierSignCheckArgs(args: { clientNonce: string, type: string, fields: Record<string, string>, masterKeyring: Record<string, string> }): void {
    if (!args.clientNonce) {
      throw new Error('Missing client nonce!');
    }
    if (!args.type) {
      throw new Error('Missing certificate type!');
    }
    if (!args.fields) {
      throw new Error('Missing certificate fields to sign!');
    }
    if (!args.masterKeyring) {
      throw new Error('Missing masterKeyring to decrypt fields!');
    }
  }
}