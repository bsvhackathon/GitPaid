import { Transaction } from '@bsv/sdk';
import pushdrop from 'pushdrop';
export default class BountyTopicManager {
    /**
     * Identifies which outputs in a transaction contain valid bounty contracts
     *
     * @param beef - The transaction data in BEEF format
     * @param previousCoins - The previous coins to consider
     * @returns Instructions on which outputs to admit and which coins to retain
     */
    async identifyAdmissibleOutputs(beef, previousCoins) {
        const admissibleOutputs = [];
        try {
            const decodedTx = Transaction.fromBEEF(beef);
            const outputs = decodedTx.outputs;
            // 1. First, check if this transaction interacts with existing bounty contracts
            // If previousCoins is non-empty, this is likely updating or claiming a bounty
            if (previousCoins.length > 0) {
                return {
                    outputsToAdmit: previousCoins,
                    coinsToRetain: previousCoins
                };
            }
            // 2. For new transactions, check each output for valid bounty contract creation
            for (const [index, output] of outputs.entries()) {
                try {
                    // Using pushdrop to decode the script
                    const decodedScript = await pushdrop.decode({
                        script: output.lockingScript.toHex(),
                        fieldFormat: "buffer"
                    });
                    const fields = decodedScript.fields;
                    // Validate expected fields for a bounty
                    if (fields.length < 7)
                        continue;
                    // 1. Repository owner 
                    if (!fields[0] || fields[0].length === 0)
                        continue;
                    // 2. Repository name
                    if (!fields[1] || fields[1].length === 0)
                        continue;
                    // 3. Issue number
                    const issueNumber = parseInt(fields[2].toString(), 10);
                    if (isNaN(issueNumber) || issueNumber <= 0)
                        continue;
                    // 4. Bounty amount
                    const amount = parseInt(fields[3].toString(), 10);
                    if (isNaN(amount) || amount <= 0)
                        continue;
                    // 5. Funder's public key
                    if (!fields[4] || fields[4].length === 0)
                        continue;
                    try {
                        // Validate public key format
                        //PublicKey.fromString(fields[4].toString('utf8'))
                    }
                    catch {
                        continue;
                    }
                    // Valid bounty format - add to admissible outputs
                    admissibleOutputs.push(index);
                    console.log(`Topic Manager: Valid bounty found at output ${index}`);
                }
                catch (error) {
                    console.log(`Topic Manager: Error processing output ${index}:`, error);
                    continue;
                }
            }
        }
        catch (error) {
            console.error('Topic Manager: Error identifying admissible outputs:', error);
        }
        return {
            outputsToAdmit: admissibleOutputs,
            coinsToRetain: previousCoins
        };
    }
    /**
     * Returns documentation for this topic manager
     */
    async getDocumentation() {
        return `
    # GitHub Bounty Topic Manager
    
    This topic manager processes transactions related to GitHub bounties.
    
    ## Supported Transaction Types
    
    1. **Bounty Creation**: Create a new bounty for a GitHub issue
    2. **Fund Addition**: Add more funds to an existing bounty
    3. **Bounty Claim**: Claim funds for solving an issue
    4. **Withdrawal**: Repository owner withdrawing bounty funds
    
    ## Data Structure
    
    The bounty transactions contain the following data:
    - Repository owner and certification authority public keys
    - GitHub repository owner name
    - GitHub repository name 
    - GitHub issue number
    - Bounty amount in satoshis
    `;
    }
    /**
     * Returns metadata about this topic manager
     */
    async getMetaData() {
        return {
            name: 'GitHub Bounty Topic Manager',
            shortDescription: 'Processes transactions for GitHub issue bounties',
            version: '1.0.0',
            informationURL: 'https://github.com/yourusername/github-bounties'
        };
    }
}
//# sourceMappingURL=BountyTopicManager.js.map