import { WalletClient} from '@bsv/sdk';
import { bountyAPI } from './api';
import { BountyContract, BountyArtifact } from '@bsv/backend';
import { Sig, MethodCallOptions, toByteString, PubKey } from 'scrypt-ts';
import { PublicKey, Utils } from '@bsv/sdk';

// Initialize the smart contract
BountyContract.loadArtifact(BountyArtifact);

// Initialize wallet client
let walletClient: WalletClient | null = null;

// Initialize the wallet
export const initializeWallet = async (): Promise<WalletClient> => {
  if (walletClient) {
    return walletClient;
  }

  walletClient = new WalletClient('auto');
  return walletClient;
};

// Get wallet balance from the backend
export const getWalletBalance = async (): Promise<number> => {
  try {
    const { balance } = await bountyAPI.getWalletBalance();
    return balance;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
};

// Format satoshis to a readable format (BSV)
export const formatSatoshis = (satoshis: number): string => {
  // 1 BSV = 100,000,000 satoshis
  const bsv = satoshis / 100000000;
  return bsv.toFixed(8) + ' BSV';
};

// Format satoshis to USD (approximate conversion)
export const satoshisToUSD = (satoshis: number, exchangeRate: number = 40): string => {
  // Example exchange rate: 1 BSV = $40 USD
  const bsv = satoshis / 100000000;
  const usd = bsv * exchangeRate;
  return '$' + usd.toFixed(2);
};

// Create a bounty contract for a GitHub issue
export const createBountyContract = async (
  repoOwner: string,
  repoName: string,
  issueNumber: number,
  amount: number
): Promise<{ txid: string }> => {
  try {
    // Initialize wallet
    const wallet = await initializeWallet();
    
    // Get identity key
    const { publicKey: identityKey } = await wallet.getPublicKey({ identityKey: true });
    
    // Create certificate authority public key (in a real system, this would be from a trusted third party)
    const { publicKey: certPublicKey } = await wallet.getPublicKey({ 
      protocolID: [1, 'bounty-cert'],
      keyID: '1'
    });
    
    // Create new bounty contract instance
    const bountyContract = new BountyContract(
      PubKey(identityKey),
      PubKey(certPublicKey),
      toByteString(repoOwner, false),
      toByteString(repoName, false),
      BigInt(issueNumber)
    );
    
    // Get locking script
    const lockingScript = bountyContract.lockingScript.toHex();
    
    // Create transaction
    const result = await wallet.createAction({
      description: `Create bounty for ${repoOwner}/${repoName}#${issueNumber}`,
      outputs: [
        {
          lockingScript,
          satoshis: amount,
          basket: 'bounties',
          outputDescription: 'GitHub bounty for issue'
        }
      ],
      options: {
        acceptDelayedBroadcast: true
      }
    });
    
    // Safely handle potential undefined txid
    if (!result.txid) {
      throw new Error('Transaction ID was not returned');
    }

    // Register with backend
    await bountyAPI.createBounty({
      repositoryOwner: repoOwner,
      repositoryName: repoName,
      issueNumber,
      issueTitle: `Issue #${issueNumber}`,
      amount
    });
    
    return { txid: result.txid };
  } catch (error) {
    console.error('Error creating bounty contract:', error);
    throw error;
  }
};

// Add more funds to an existing bounty
export const addFundsToBounty = async (
  txid: string,
  outputIndex: number,
  lockingScript: string,
  currentAmount: number,
  additionalAmount: number
): Promise<{ txid: string }> => {
  try {
    // Initialize wallet
    const wallet = await initializeWallet();
    
    // Create contract instance from locking script
    const bountyContract = BountyContract.fromLockingScript(lockingScript) as BountyContract;
    
    // Generate unlocking script for adding funds
    const unlockingScript = await bountyContract.getUnlockingScript(async (self: BountyContract) => {
      // Call contract method to add funds
      self.addFunds();
    });
    
    // Create transaction
    const result = await wallet.createAction({
      description: 'Add funds to bounty',
      inputs: [
        {
          outpoint: `${txid}.${outputIndex}`,
          unlockingScript: unlockingScript.toHex(),
          inputDescription: 'Existing bounty UTXO'
        }
      ],
      outputs: [
        {
          lockingScript,
          satoshis: currentAmount + additionalAmount,
          basket: 'bounties',
          outputDescription: 'Updated GitHub bounty for issue'
        }
      ],
      options: {
        acceptDelayedBroadcast: true
      }
    });
    
    // Safely handle potential undefined txid
    if (!result.txid) {
      throw new Error('Transaction ID was not returned');
    }
    
    return { txid: result.txid };
  } catch (error) {
    console.error('Error adding funds to bounty:', error);
    throw error;
  }
};