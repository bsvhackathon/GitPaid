import { Express } from 'express-serve-static-core';

// Extend Express types
declare global {
  namespace Express {
    // Define the user object shape from GitHub profile
    interface User {
      id: string;
      displayName?: string;
      username?: string;
      profileUrl?: string;
      photos?: Array<{value: string}>;
      emails?: Array<{value: string}>;
      provider: string;
    }
  }
}

// BSV SDK types (as needed)
declare module '@bsv/sdk' {
  export type Base64String = string;
  export type CertificateFieldNameUnder50Bytes = string;
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    HTTP_PORT: string;
    BSV_NETWORK: string;
    SERVER_PRIVATE_KEY: string;
    SERVER_PUBLIC_KEY: string;
    WALLET_STORAGE_URL: string;
    CERTIFICATE_TYPE_ID: string;
    
    // GitHub OAuth
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CALLBACK_URL: string;
    
    // Security
    SESSION_SECRET: string;
  }
}