/**
 * Simple logger utility to standardize logging across the application
 */
export const logger = {
    info: (message: string, ...args: any[]): void => {
      console.log(`[INFO] ${message}`, ...args);
    },
    
    debug: (message: string, ...args: any[]): void => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEBUG] ${message}`, ...args);
      }
    },
    
    warn: (message: string, ...args: any[]): void => {
      console.warn(`[WARN] ${message}`, ...args);
    },
    
    error: (message: string, ...args: any[]): void => {
      console.error(`[ERROR] ${message}`, ...args);
    }
  };