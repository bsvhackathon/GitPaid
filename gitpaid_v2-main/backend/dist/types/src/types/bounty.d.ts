export interface BountyRecord {
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    issueTitle: string;
    description: string;
    amount: number;
    funderPublicKey: string;
    txid: string;
    outputIndex: number;
    status: string;
    solver: string | null;
    solverPublicKey: string | null;
    createdAt: Date;
    updatedAt: Date;
    claimTxid?: string;
}
export interface BountyReference {
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    issueTitle: string;
    amount: number;
    status: string;
    txid: string;
    outputIndex: number;
    createdAt: Date;
}
export interface RepoIssueReference {
    repoOwner: string;
    repoName: string;
    totalBounties: number;
    totalAmount: number;
    openBounties: number;
}
export interface CreateBountyParams {
    repoOwner: string;
    repoName: string;
    issueNumber: number;
    issueTitle: string;
    description: string;
    amount: number;
    funderPublicKey: string;
}
//# sourceMappingURL=bounty.d.ts.map