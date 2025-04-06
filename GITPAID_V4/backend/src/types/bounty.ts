// backend/src/types/bounty.ts

export interface BountyRecord {
    repoOwner: string           // GitHub repository owner/organization
    repoName: string            // GitHub repository name
    issueNumber: number         // GitHub issue number
    issueTitle: string          // GitHub issue title
    description: string         // Bounty description
    amount: number              // Bounty amount (in satoshis)
    funderPublicKey: string     // Public key of the user who funded the bounty
    txid: string                // Transaction ID for the bounty
    outputIndex: number         // Output index in the transaction
    status: string              // Status: "open", "in-progress", "claimed", "cancelled"
    solver: string | null       // GitHub username of the solver (if claimed)
    solverPublicKey: string | null // Public key of the solver (if claimed)
    createdAt: Date             // When the bounty was created
    updatedAt: Date             // When the bounty was last updated
    claimTxid?: string          // Transaction ID of the claim (if claimed)
  }
  
  // Simplified bounty reference for list views
  export interface BountyReference {
    repoOwner: string
    repoName: string
    issueNumber: number
    issueTitle: string
    amount: number
    status: string
    txid: string
    outputIndex: number
    createdAt: Date
  }
  
  // Repository with bounty statistics
  export interface RepoIssueReference {
    repoOwner: string
    repoName: string
    totalBounties: number
    totalAmount: number
    openBounties: number
  }
  
  // Data structure for creating a new bounty
  export interface CreateBountyParams {
    repoOwner: string
    repoName: string
    issueNumber: number
    issueTitle: string
    description: string
    amount: number
    funderPublicKey: string
  }