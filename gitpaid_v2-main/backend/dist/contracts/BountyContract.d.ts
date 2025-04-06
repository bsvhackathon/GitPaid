import { ByteString, PubKey, Sig, SmartContract } from 'scrypt-ts';
/**
 * A smart contract for GitHub issues-based bounties.
 *
 * This contract allows:
 * 1. Creating bounties for GitHub issues
 * 2. Adding funds to existing bounties
 * 3. Claiming bounties with certification from GitHub identity authority
 * 4. Withdrawing unclaimed bounties
 */
export declare class BountyContract extends SmartContract {
    repoOwner: PubKey;
    certServerKey: PubKey;
    repoOwnerName: ByteString;
    repoName: ByteString;
    issueNumber: bigint;
    constructor(repoOwner: PubKey, certServerKey: PubKey, repoOwnerName: ByteString, repoName: ByteString, issueNumber: bigint);
    /**
     * Allow the repo owner to add more funds into the contract.
     */
    addFunds(): void;
    /**
     * Pay a user for solving a GitHub issue.
     *
     * @param repoOwnerSig   ECDSA signature from the repoOwner for spending
     * @param certServerSig  ECDSA signature from the certificate server
     * @param userPubKey     The public key of developer who solved it
     * @param amount         How much the dev is paid (remaining stays in contract)
     */
    payBounty(repoOwnerSig: Sig, certServerSig: Sig, userPubKey: PubKey, amount: bigint): void;
    /**
     * Allow the repo owner to withdraw funds if needed
     */
    withdraw(repoOwnerSig: Sig, amount: bigint): void;
}
