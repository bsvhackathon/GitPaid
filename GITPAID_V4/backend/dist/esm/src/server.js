// src/server.ts
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017');
let db;
// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;
// Required environment variables
const requiredEnvVars = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'SESSION_SECRET'
];
// Check for required environment variables
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Environment variable ${envVar} is required`);
        process.exit(1);
    }
}
// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
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
        }
        else {
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// GitHub OAuth strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? "https://api.gitpaid.app/auth/github/callback"
        : "http://localhost:8080/auth/github/callback",
    scope: ['user:email', 'read:org', 'repo']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        await mongoClient.connect();
        const users = db.collection('users');
        // Find or create user
        let user = await users.findOne({ githubId: profile.id });
        if (!user) {
            const newUser = {
                githubId: profile.id,
                username: profile.username,
                displayName: profile.displayName || profile.username,
                emails: profile.emails ? profile.emails.map((email) => email.value) : [],
                avatarUrl: profile._json.avatar_url,
                accessToken,
                refreshToken,
                createdAt: new Date(),
                walletBalance: 500000, // Mock initial balance (500,000 satoshis)
            };
            await users.insertOne(newUser);
            return done(null, newUser);
        }
        else {
            // Update accessToken
            await users.updateOne({ githubId: profile.id }, { $set: { accessToken, refreshToken, lastLogin: new Date() } });
            // Return updated user
            const updatedUser = await users.findOne({ githubId: profile.id });
            return done(null, updatedUser);
        }
    }
    catch (error) {
        console.error("Error in GitHub OAuth callback:", error);
        return done(error);
    }
}));
// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.githubId);
});
// Deserialize user from session
passport.deserializeUser(async (githubId, done) => {
    try {
        await mongoClient.connect();
        const users = db.collection('users');
        const user = await users.findOne({ githubId });
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};
// Routes
// OAuth routes
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: process.env.NODE_ENV === 'production'
        ? 'https://gitpaid.app?authError=true'
        : 'http://localhost:5173?authError=true'
}), (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.NODE_ENV === 'production'
        ? 'https://gitpaid.app?authSuccess=true'
        : 'http://localhost:5173?authSuccess=true');
});
// Check auth status
app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        const { accessToken, refreshToken, ...userWithoutTokens } = req.user;
        res.json({
            isAuthenticated: true,
            user: userWithoutTokens
        });
    }
    else {
        res.json({ isAuthenticated: false });
    }
});
// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.json({ success: true });
    });
});
app.get('/api/user-info', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        // Return user data as JSON
        res.json({
            authenticated: true,
            username: req.user.username,
            displayName: req.user.displayName,
            email: req.user.emails && req.user.emails.length > 0
                ? req.user.emails[0]
                : null,
            avatarUrl: req.user.avatarUrl,
            walletBalance: req.user.walletBalance
        });
    }
    else {
        // User is not authenticated
        res.status(401).json({ authenticated: false });
    }
});
// Repositories
app.get('/api/repositories', isAuthenticated, async (req, res) => {
    try {
        const { accessToken } = req.user;
        // Fetch repositories from GitHub API
        const response = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            params: {
                sort: 'updated',
                visibility: 'all',
                per_page: 100
            }
        });
        const repositories = response.data.map((repo) => ({
            id: repo.id,
            name: repo.name,
            description: repo.description || '',
            stars: repo.stargazers_count,
            issues: repo.open_issues_count,
            language: repo.language || 'Unknown',
            url: repo.html_url,
            owner: repo.owner.login,
            private: repo.private,
            fullName: repo.full_name
        }));
        res.json(repositories);
    }
    catch (error) {
        console.error('Error fetching repositories:', error);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});
// Get issues for a repository
app.get('/api/repositories/:owner/:repo/issues', isAuthenticated, async (req, res) => {
    try {
        const { accessToken } = req.user;
        const { owner, repo } = req.params;
        // Fetch issues from GitHub API
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            params: {
                state: 'open',
                per_page: 100
            }
        });
        // Get bounties for these issues
        await mongoClient.connect();
        const bounties = db.collection('bounties');
        const existingBounties = await bounties.find({
            repositoryOwner: owner,
            repositoryName: repo
        }).toArray();
        // Map of issue number to bounty
        const bountyMap = existingBounties.reduce((map, bounty) => {
            map[bounty.issueNumber] = bounty;
            return map;
        }, {});
        const issues = response.data.map((issue) => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            description: issue.body,
            state: issue.state,
            labels: issue.labels.map((label) => label.name),
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            url: issue.html_url,
            bounty: bountyMap[issue.number] ? bountyMap[issue.number].amount : 0
        }));
        res.json(issues);
    }
    catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});
// Fund a bounty (simplified - just stores in DB without blockchain integration)
app.post('/api/bounties', isAuthenticated, async (req, res) => {
    try {
        const { repositoryOwner, repositoryName, issueNumber, issueTitle, amount } = req.body;
        if (!repositoryOwner || !repositoryName || !issueNumber || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Parse and validate amount
        const bountyAmount = parseInt(amount);
        if (isNaN(bountyAmount) || bountyAmount <= 0) {
            return res.status(400).json({ error: 'Invalid bounty amount' });
        }
        await mongoClient.connect();
        const users = db.collection('users');
        const bounties = db.collection('bounties');
        // Check user's balance
        const user = await users.findOne({ githubId: req.user.githubId });
        if (!user || user.walletBalance < bountyAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        // Check if a bounty already exists
        const existingBounty = await bounties.findOne({
            repositoryOwner,
            repositoryName,
            issueNumber
        });
        if (existingBounty) {
            // Update existing bounty
            await bounties.updateOne({ _id: existingBounty._id }, {
                $set: {
                    amount: bountyAmount,
                    updatedAt: new Date()
                }
            });
            // If amount increased, deduct the difference from the user's balance
            if (bountyAmount > existingBounty.amount) {
                const difference = bountyAmount - existingBounty.amount;
                await users.updateOne({ githubId: req.user.githubId }, { $inc: { walletBalance: -difference } });
            }
            // Return the updated bounty
            const updatedBounty = await bounties.findOne({ _id: existingBounty._id });
            return res.json(updatedBounty);
        }
        // Create new bounty
        const newBounty = {
            repositoryOwner,
            repositoryName,
            issueNumber,
            issueTitle,
            amount: bountyAmount,
            funder: {
                githubId: req.user.githubId,
                username: req.user.username
            },
            status: 'open',
            solver: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await bounties.insertOne(newBounty);
        // Deduct the amount from the user's balance
        await users.updateOne({ githubId: req.user.githubId }, { $inc: { walletBalance: -bountyAmount } });
        // Get the created bounty
        const createdBounty = await bounties.findOne({ _id: result.insertedId });
        res.status(201).json(createdBounty);
    }
    catch (error) {
        console.error('Error creating bounty:', error);
        res.status(500).json({ error: 'Failed to create bounty' });
    }
});
// Get user's funded bounties
app.get('/api/bounties/funded', isAuthenticated, async (req, res) => {
    try {
        await mongoClient.connect();
        const bounties = db.collection('bounties');
        const fundedBounties = await bounties.find({
            'funder.githubId': req.user.githubId
        }).toArray();
        res.json(fundedBounties);
    }
    catch (error) {
        console.error('Error fetching funded bounties:', error);
        res.status(500).json({ error: 'Failed to fetch funded bounties' });
    }
});
// Get user wallet balance
app.get('/api/wallet/balance', isAuthenticated, async (req, res) => {
    try {
        await mongoClient.connect();
        const users = db.collection('users');
        const user = await users.findOne({ githubId: req.user.githubId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ balance: user.walletBalance });
    }
    catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
});
// Initialize MongoDB connection and start server
async function startServer() {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
        db = mongoClient.db('bsv-bounties');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}
startServer();
// Handle graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoClient.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
});
//# sourceMappingURL=server.js.map