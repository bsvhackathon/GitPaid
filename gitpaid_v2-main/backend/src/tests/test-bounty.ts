// test-bounty.js
import { WalletClient, TopicBroadcaster, Utils, PushDrop, Transaction} from '@bsv/sdk';

async function createAndBroadcastBounty() {
  try {
    // Initialize the wallet
    const wallet = new WalletClient('auto', 'localhost');
    debugger
    // Sample bounty data
    const repoOwner = 'bitcoin-sv';
    const repoName = 'bsv-overlay';
    const issueNumber = 42;
    const amount = 20000; // 50,000 satoshis
    const funderPublicKey = (await wallet.getPublicKey({ identityKey: true })).publicKey.toString();
    const issueTitle = 'Fix performance in Topic Manager';
    const description = 'The topic manager is slow when processing large transactions';
    
    // Create fields for the pushdrop
    const fields = [
      Utils.toArray(repoOwner, 'utf8'),
      Utils.toArray(repoName, 'utf8'),
      Utils.toArray(issueNumber.toString(), 'utf8'),
      Utils.toArray(amount.toString(), 'utf8'),
      Utils.toArray(funderPublicKey, 'utf8'),
      Utils.toArray(issueTitle, 'utf8'),
      Utils.toArray(description, 'utf8')
    ];
    
    const pushdrop = new PushDrop(wallet)
    const lockingScript = await pushdrop.lock(
        fields,
        [2, 'githubbounty'],
        '1',
        'anyone',
        true
    )
    
    debugger
    
    // Create the transaction
    const { txid, tx } = await wallet.createAction({
      outputs: [{
        lockingScript: lockingScript.toHex(),
        satoshis: 1000, // Dust limit plus a bit extra
        outputDescription: 'GitHub Bounty'
      }],
      description: `Create bounty for ${repoOwner}/${repoName}#${issueNumber}`
    });
    
    console.log(`Transaction created with txid: ${txid}`);
    
    // Broadcast the transaction to the topic manager
    const broadcaster = new TopicBroadcaster(['tm_bounty'], { networkPreset: 'local' });
    //const broadcaster = new TopicBroadcaster(['tm_bounty'], {
      //networkPreset: window.location.hostname === 'localhost' ? 'local' : 'mainnet'
  //})
    await broadcaster.broadcast(Transaction.fromAtomicBEEF(tx!));
    
    console.log(`Transaction broadcast to topic manager successfully`);
    
    return txid;
  } catch (error) {
    console.error('Error creating or broadcasting bounty:', error);
    throw error;
  }
}

createAndBroadcastBounty()
  .then(txid => console.log(`Test complete! Bounty created with txid: ${txid}`))
  .catch(err => console.error('Test failed:', err));