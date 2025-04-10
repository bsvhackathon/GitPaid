import { AdmittanceInstructions, TopicManager } from '@bsv/overlay';
export default class BountyTopicManager implements TopicManager {
    /**
     * Identifies which outputs in a transaction contain valid bounty contracts
     *
     * @param beef - The transaction data in BEEF format
     * @param previousCoins - The previous coins to consider
     * @returns Instructions on which outputs to admit and which coins to retain
     */
    identifyAdmissibleOutputs(beef: number[], previousCoins: number[]): Promise<AdmittanceInstructions>;
    /**
     * Returns documentation for this topic manager
     */
    getDocumentation(): Promise<string>;
    /**
     * Returns metadata about this topic manager
     */
    getMetaData(): Promise<{
        name: string;
        shortDescription: string;
        iconURL?: string;
        version?: string;
        informationURL?: string;
    }>;
}
//# sourceMappingURL=BountyTopicManager.d.ts.map