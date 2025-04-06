/**
 * Storage class for managing bounty records
 */
export class BountyStorage {
    /**
     * Constructs a new BountyStorage instance
     * @param {Db} db - connected mongo database instance
     */
    constructor(db) {
        this.db = db;
        this.bounties = db.collection('GitHubBounties');
    }
    /**
     * Stores a bounty record in the database
     */
    async storeBounty(repoOwner, repoName, issueNumber, amount, funderPublicKey, issueTitle, description, txid, outputIndex, status) {
        console.log("Storing bounty in MongoDB:", {
            repoOwner,
            repoName,
            issueNumber,
            amount,
            funderPublicKey,
            issueTitle,
            txid,
            outputIndex,
            status
        });
        try {
            await this.bounties.insertOne({
                repoOwner,
                repoName,
                issueNumber,
                amount,
                funderPublicKey,
                issueTitle,
                description,
                txid,
                outputIndex,
                status,
                solver: null,
                solverPublicKey: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        catch (error) {
            console.error("Failed to store bounty record:", error);
            throw error;
        }
    }
    /**
     * Updates a bounty's status
     */
    async updateBountyStatus(txid, outputIndex, status) {
        await this.bounties.updateOne({ txid, outputIndex }, {
            $set: {
                status,
                updatedAt: new Date()
            }
        });
    }
    /**
     * Updates a bounty's solver information
     */
    async updateBountySolver(txid, outputIndex, solver, solverPublicKey) {
        await this.bounties.updateOne({ txid, outputIndex }, {
            $set: {
                solver,
                solverPublicKey,
                status: 'in-progress',
                updatedAt: new Date()
            }
        });
    }
    /**
     * Delete a bounty record
     */
    async deleteBounty(txid, outputIndex) {
        const result = await this.bounties.deleteMany({ txid, outputIndex });
        return result.deletedCount;
    }
    /**
     * Returns all bounties
     */
    async findAllBounties() {
        return await this.bounties.find({})
            .project({
            repoOwner: 1,
            repoName: 1,
            issueNumber: 1,
            issueTitle: 1,
            amount: 1,
            status: 1,
            txid: 1,
            outputIndex: 1
        })
            .toArray();
    }
    /**
     * Returns all bounties for a specific repo
     */
    async findBountiesByRepo(repoOwner, repoName) {
        return await this.bounties.find({ repoOwner, repoName })
            .project({
            repoOwner: 1,
            repoName: 1,
            issueNumber: 1,
            issueTitle: 1,
            amount: 1,
            status: 1,
            txid: 1,
            outputIndex: 1
        })
            .toArray();
    }
    /**
     * Returns all bounties for a specific issue
     */
    async findBountiesByIssue(repoOwner, repoName, issueNumber) {
        return await this.bounties.find({ repoOwner, repoName, issueNumber })
            .toArray();
    }
    /**
     * Returns all bounties funded by a specific user
     */
    async findBountiesByFunder(funderPublicKey) {
        return await this.bounties.find({ funderPublicKey })
            .project({
            repoOwner: 1,
            repoName: 1,
            issueNumber: 1,
            issueTitle: 1,
            amount: 1,
            status: 1,
            txid: 1,
            outputIndex: 1
        })
            .toArray();
    }
    /**
     * Returns detailed information about a specific bounty
     */
    async findBountyDetails(txid, outputIndex) {
        return await this.bounties.find({ txid, outputIndex })
            .toArray();
    }
    /**
     * Returns a list of repositories with bounties
     */
    async findReposWithBounties() {
        const repos = await this.bounties.aggregate([
            {
                $group: {
                    _id: { repoOwner: "$repoOwner", repoName: "$repoName" },
                    totalBounties: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    repoOwner: "$_id.repoOwner",
                    repoName: "$_id.repoName",
                    totalBounties: 1,
                    totalAmount: 1
                }
            }
        ]).toArray();
        return repos;
    }
}
//# sourceMappingURL=BountyStorage.js.map