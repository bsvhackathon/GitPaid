// src/overlay-server.ts
import OverlayExpress from '@bsv/overlay-express';
import dotenv from 'dotenv';
import BountyTopicManager from './topic-managers/BountyTopicManager.js';
import BountyLookupServiceFactory from './lookup-services/BountyLookupServiceFactory.js';
// Load environment variables
dotenv.config();
// Initialize and run the Overlay Express server
const main = async () => {
    // Check for required environment variables
    const requiredVars = [
        'SERVER_PRIVATE_KEY',
        'HOSTING_URL',
        'MONGO_URL',
        'KNEX_URL'
    ];
    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.error(`Error: ${varName} environment variable is required`);
            process.exit(1);
        }
    }
    console.log('Starting GitPaid Overlay Express server...');
    // Create a new OverlayExpress server instance
    const server = new OverlayExpress('gitpaid', // Name your overlay node
    process.env.SERVER_PRIVATE_KEY, // Your server's private key
    process.env.HOSTING_URL, // Your hosting URL (e.g., your domain or IP)
    process.env.ADMIN_BEARER_TOKEN // Optional admin token for protected routes
    );
    // Configure the port (default is 3000, but we'll use 8080 to match your backend)
    server.configurePort(Number(process.env.PORT || 8080));
    // Enable verbose request logging in development mode
    if (process.env.NODE_ENV !== 'production') {
        server.configureVerboseRequestLogging(true);
    }
    // Configure network (mainnet or testnet)
    server.configureNetwork(process.env.BSV_NETWORK === 'test' ? 'test' : 'main');
    // Configure database connections
    // Connect to MongoDB for lookup services
    await server.configureMongo(process.env.MONGO_URL);
    // Connect to MySQL/MariaDB with Knex
    await server.configureKnex(process.env.KNEX_URL);
    // Configure ARC API key if provided (for broadcasting transactions to the network)
    if (process.env.ARC_API_KEY) {
        server.configureArcApiKey(process.env.ARC_API_KEY);
    }
    // Configure GASP synchronization
    // Enable or disable based on env variable - default to true
    const enableGASP = process.env.ENABLE_GASP_SYNC !== 'false';
    server.configureEnableGASPSync(enableGASP);
    // Configure advanced engine parameters if needed
    server.configureEngineParams({
        logTime: true,
        logPrefix: '[GITPAID OVERLAY] ',
        throwOnBroadcastFailure: process.env.NODE_ENV === 'production',
        syncConfiguration: {
            // You can override specific topic sync behavior here
            // For example: 'tm_bounty': 'SHIP' or 'tm_bounty': false to disable sync
            'tm_bounty': enableGASP ? 'SHIP' : false
        }
    });
    // Configure custom Web UI appearance
    server.configureWebUI({
        primaryColor: '#2da44e', // GitHub-like green color from your theme
        secondaryColor: '#24292e', // GitHub-like dark color
        backgroundColor: '#f6f8fa', // GitHub-like light background
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    });
    // Configure your topic managers
    server.configureTopicManager('tm_bounty', new BountyTopicManager());
    // Configure your lookup services
    server.configureLookupServiceWithMongo('ls_bounty', BountyLookupServiceFactory);
    // Configure the engine and start the server
    await server.configureEngine();
    await server.start();
};
// Handle errors gracefully
main()
    .then(() => {
    console.log('GitPaid Overlay Express server started successfully!');
})
    .catch((error) => {
    console.error('Failed to start GitPaid Overlay Express server:', error);
    process.exit(1);
});
//# sourceMappingURL=overlay-server.js.map