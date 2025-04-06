import { LookupService, LookupQuestion, LookupAnswer, LookupFormula } from '@bsv/overlay';
import { BountyStorage } from './BountyStorage.js';
import { Script } from '@bsv/sdk';
import { Db } from 'mongodb';
/**
 * Implements a lookup service for GitHub issue bounties
 */
declare class BountyLookupService implements LookupService {
    storage: BountyStorage;
    /**
     * Constructs a new BountyLookupService instance
     * @param storage - The storage instance to use for managing bounty records
     */
    constructor(storage: BountyStorage);
    /**
     * Processes a new output that has been added to the blockchain
     */
    outputAdded(txid: string, outputIndex: number, outputScript: Script, topic: string): Promise<void>;
    /**
     * Handles outputs that have been spent
     */
    outputSpent(txid: string, outputIndex: number, topic: string): Promise<void>;
    /**
     * Handles outputs that have been deleted from the blockchain
     */
    outputDeleted(txid: string, outputIndex: number, topic: string): Promise<void>;
    /**
     * Handles queries to the lookup service
     */
    lookup(question: LookupQuestion): Promise<LookupAnswer | LookupFormula>;
    /**
     * Returns documentation for this lookup service
     */
    getDocumentation(): Promise<string>;
    /**
     * Returns metadata about this lookup service
     */
    getMetaData(): Promise<{
        name: string;
        shortDescription: string;
        iconURL?: string;
        version?: string;
        informationURL?: string;
    }>;
}
declare const _default: (db: Db) => BountyLookupService;
export default _default;
