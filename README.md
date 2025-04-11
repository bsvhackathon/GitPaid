# Git(Whatever I decide on calling it) - Fund GitHub Issues with BSV Bounties (Still in development)

Git-something is a platform that allows users to fund GitHub issues with Bitcoin SV (BSV) bounties, incentivizing developers to solve open source problems. The project connects GitHub's issue tracking system with the BSV blockchain, enabling transparent and efficient bounty management.

## Features

- **GitHub Integration**: Sign in with your GitHub account to access your repositories and issues
- **Bounty Creation**: Fund any open GitHub issue with BSV bounties
- **Overlay-services**: Uses BSV/SDK's overlay services to seemlessly lookup and track active bounties.
- **Smart Contract-Based**: Uses BSV smart contracts to ensure secure and transparent bounty handling
- **Identity Gated Integration**: Uses the power of metanet desktop to provide identity-gated actions such as creating or accepting a bounty.


## Project Structure

```
gitpaid_v2-main/
├── backend/                 # Backend server code
│   ├── artifacts/           # Smart contract artifacts
│   ├── src/                 # Source code
│   │   ├── contracts/       # Smart contracts
│   │   ├── lookup-services/ # Overlay network lookup services
│   │   ├── server.ts        # Express server for github authentication
│   │   ├── tests/           # Test scripts
│   │   ├── topic-managers/  # Overlay network topic managers
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json         # Backend dependencies
├── frontend/                # React frontend code
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── context/         # React context for state management
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json         # Frontend dependencies
└── deployment-info.json     # Deployment configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.org/) (v4.4 or higher)
- [GitHub App](https://github.com/settings/developers) (for authentication)
- [Metanet Desktop CLient](https://github.com/bitcoin-sv/metanet-desktop)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/bsvhackathon/GitPaid.git
cd GitPaid

# The semi-working version is in gitpaid_v2-main so make sure you are working in there and not GITPAID_V4
cd gitpaid_v2-main

# Install dependencies (LARS and CARS)
npm install
```

### 2. Backend Setup
### Rename .env.template to .env in /backend and put in appropriate values (See step 4 and 5)

```bash
# Navigate to backend directory
cd ../backend

# Install dependencies
npm install

# Compile scrypt smart contract
npm run compile

# Build backend
npm run build

```
### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build the frontend to verify no errors, if there are errors you may not have built/compiled the backend
npm run build
```
### 4. Setup GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New Github App"
3. Fill in the application details:
   - Application name: Whatever-you-want-to-call-it
   - Homepage URL: http://localhost:5173
   - Authorization callback URL: http://localhost:8088/auth/github/callback
4. Set up Github App permissions
   - Contents: Read-only
   - Issues: Read and write
   - Pull requests: Read and write
   - In account permissions Watching: Read-only
7. Copy the Client ID and Client Secret to your `.env` file

### 5. Configure Environment Variables

Edit the `.env` file and fill in the required values:

# Node environment
NODE_ENV=development

# Server configuration
PORT=8088
HTTP_PORT=3002

# BSV Network configuration
BSV_NETWORK=main

# Server private key (generate a secure private key)
SERVER_PRIVATE_KEY='your_hex_64_char_private_key'

# MongoDB connection
MONGODB_URI='mongodb://localhost:27017/overlay-db'

# Session Secret (generate a secure random string)
SESSION_SECRET='your_secure_session_secret'

# GitHub Configuration (from your GitHub app)
GITHUB_CLIENT_ID='your_github_client_id'
GITHUB_CLIENT_SECRET='your_github_client_secret'

# Wallet Configuration
WALLET_STORAGE_URL='https://storage.babbage.systems'

# Certificate Configuration
CERTIFICATE_TYPE_ID='Z2l0aHViLWlkZW50aXR5'

### 6. Start up lars and run the express server for the backend
```bash
# Move into main directory, you should be in GitPaid/gitpaid_v2-main
cd gitpaid_v2-main

# Start lars with default config settings (MAKE SURE YOU HAVE METANET DESKTOP RUNNING AND ACCESSIBLE)
npm run lars

# Start the express server (It is in the backend, so you need a seperate terminal)
cd backend
npm run start

```
The application should now be accessible at http://localhost:5173

## Development Commands

### Backend

```bash
# Build the backend
npm run build

# Start with automatic reloading for development
npm run dev

# Compile smart contracts
npm run compile

# Test the overlay-services by creating a test bounty
npm run run-test-bounty

# Test the overlay-service lookup-service by querying active bounties
npm run run-query-bounty

```

### Frontend

```bash
# Start development server
npm run start

# Build for production
npm run build

# Lint code
npm run lint
```

## Architecture

Git-something is built using:

- **Frontend**: React with Material-UI
- **Backend**: Node.js with Express
- **Authentication**: GitHub OAuth
- **Database**: MongoDB
- **Blockchain**: BSV (Bitcoin SV)
- **Smart Contracts**: sCrypt (BSV smart contract language)
- **Overlay Network**: BSV Overlay Network for transaction indexing and querying

The application uses the BSV Overlay Network with custom Topic Managers and Lookup Services to track bounty transactions on the blockchain.

## License

Open BSV License version 4

Copyright (c) 2023 BSV Blockchain Association ("Bitcoin Association")
 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
 
1 - The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

2 - The Software, and any software that is derived from the Software or parts thereof,
can only be used on the Bitcoin SV blockchains. The Bitcoin SV blockchains are defined,
for purposes of this license, as the Bitcoin blockchain containing block height #556767
with the hash "000000000000000001d956714215d96ffc00e0afda4cd0a96c96f8d802b1662b" and
that contains the longest persistent chain of blocks accepted by this Software and which are valid under the rules set forth in the Bitcoin white paper (S. Nakamoto, Bitcoin: A Peer-to-Peer Electronic Cash System, posted online October 2008) and the latest version of this Software available in this repository or another repository designated by Bitcoin Association,
as well as the test blockchains that contain the longest persistent chains of blocks accepted by this Software and which are valid under the rules set forth in the Bitcoin whitepaper (S. Nakamoto, Bitcoin: A Peer-to-Peer Electronic Cash System, posted online October 2008) and the latest version of this Software available in this repository, or another repository designated by Bitcoin Association
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Contributing

Contributions are welcome! This app is still very experimental. Please feel free to submit a Pull Request.