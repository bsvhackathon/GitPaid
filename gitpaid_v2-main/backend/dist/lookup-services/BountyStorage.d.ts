import { Db } from 'mongodb';
import { BountyRecord, BountyReference, RepoIssueReference } from '../types/bounty.js';
/**
 * Storage class for managing bounty records
 */
export declare class BountyStorage {
    private readonly db;
    private readonly bounties;
    /**
     * Constructs a new BountyStorage instance
     * @param {Db} db - connected mongo database instance
     */
    constructor(db: Db);
    /**
     * Stores a bounty record in the database
     */
    storeBounty(repoOwner: string, repoName: string, issueNumber: number, amount: number, funderPublicKey: string, issueTitle: string, description: string, txid: string, outputIndex: number, status: string): Promise<void>;
    /**
     * Updates a bounty's status
     */
    updateBountyStatus(txid: string, outputIndex: number, status: string): Promise<void>;
    /**
     * Updates a bounty's solver information
     */
    updateBountySolver(txid: string, outputIndex: number, solver: string, solverPublicKey: string): Promise<void>;
    /**
     * Delete a bounty record
     */
    deleteBounty(txid: string, outputIndex: number): Promise<number>;
    /**
     * Returns all bounties
     */
    findAllBounties(): Promise<BountyReference[]>;
    /**
     * Returns all bounties for a specific repo
     */
    findBountiesByRepo(repoOwner: string, repoName: string): Promise<BountyReference[]>;
    /**
     * Returns all bounties for a specific issue
     */
    findBountiesByIssue(repoOwner: string, repoName: string, issueNumber: number): Promise<BountyRecord[]>;
    /**
     * Returns all bounties funded by a specific user
     */
    findBountiesByFunder(funderPublicKey: string): Promise<BountyReference[]>;
    /**
     * Returns detailed information about a specific bounty
     */
    findBountyDetails(txid: string, outputIndex: number): Promise<BountyRecord[]>;
    /**
     * Returns a list of repositories with bounties
     */
    findReposWithBounties(): Promise<RepoIssueReference[]>;
}
