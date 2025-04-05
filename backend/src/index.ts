import * as dotenv from 'dotenv';
import { CertifierServer, CertifierServerOptions } from './CertifierServer';
import { Setup } from '@bsv/wallet-toolbox';
import { Chain } from '@bsv/wallet-toolbox/out/src/sdk';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Environment variables
const {
  NODE_ENV = 'development',
  BSV_NETWORK = 'main',
  HTTP_PORT = '3002',
  SERVER_PRIVATE_KEY = '',// MY SERVER PRIVATE KEY IS HERE
  WALLET_STORAGE_URL = 'https://storage.babbage.systems',
  CERTIFICATE_TYPE_ID = 'Z2l0aHViLWlkZW50aXR5'
} = process.env;

logger.info(`Starting GitCert in ${NODE_ENV} mode`);
logger.info(`Certificate Type ID: ${CERTIFICATE_TYPE_ID}`);

async function setupCertifierServer(): Promise<{
  server: CertifierServer
}> {
  try {
    if (!SERVER_PRIVATE_KEY) {
      throw new Error('SERVER_PRIVATE_KEY must be set in environment variables');
    }

    logger.info('Initializing BSV wallet...');
    const wallet = await Setup.createWalletClientNoEnv({
      chain: BSV_NETWORK as Chain,
      rootKeyHex: SERVER_PRIVATE_KEY,
      storageUrl: WALLET_STORAGE_URL
    });
    
    // Get wallet public key for logging
    const { publicKey } = await wallet.getPublicKey({ identityKey: true });
    logger.info(`Wallet initialized with public key: ${publicKey}`);

    // Set up server options
    const serverOptions: CertifierServerOptions = {
      port: Number(HTTP_PORT),
      wallet,
      monetize: false, // Set to true to enable payment middleware
      calculateRequestPrice: async () => {
        return 0 // Monetize your server here! Price is in satoshis.
      }
    };
    
    logger.info('Creating GitCert server...');
    const server = new CertifierServer({}, serverOptions);

    return {
      server
    };
  } catch (error) {
    logger.error('Error setting up Wallet Storage and Monitor:', error);
    throw error;
  }
}

// Main function to start the server
(async () => {
  try {
    const context = await setupCertifierServer();
    context.server.start();
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
})().catch(e => {
  logger.error('Unhandled exception:', e);
  process.exit(1);
});
