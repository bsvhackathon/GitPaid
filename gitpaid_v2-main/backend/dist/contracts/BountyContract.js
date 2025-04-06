var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { assert, PubKey, Sig, SmartContract, prop, method, hash256, Utils, pubKey2Addr } from 'scrypt-ts';
/**
 * A smart contract for GitHub issues-based bounties.
 *
 * This contract allows:
 * 1. Creating bounties for GitHub issues
 * 2. Adding funds to existing bounties
 * 3. Claiming bounties with certification from GitHub identity authority
 * 4. Withdrawing unclaimed bounties
 */
export class BountyContract extends SmartContract {
    constructor(repoOwner, certServerKey, repoOwnerName, repoName, issueNumber) {
        super(...arguments);
        this.repoOwner = repoOwner;
        this.certServerKey = certServerKey;
        this.repoOwnerName = repoOwnerName;
        this.repoName = repoName;
        this.issueNumber = issueNumber;
    }
    /**
     * Allow the repo owner to add more funds into the contract.
     */
    addFunds() {
        const out = this.buildStateOutput(this.ctx.utxo.value);
        const outputs = out + this.buildChangeOutput();
        assert(hash256(outputs) == this.ctx.hashOutputs, 'hashOutputs mismatch');
    }
    /**
     * Pay a user for solving a GitHub issue.
     *
     * @param repoOwnerSig   ECDSA signature from the repoOwner for spending
     * @param certServerSig  ECDSA signature from the certificate server
     * @param userPubKey     The public key of developer who solved it
     * @param amount         How much the dev is paid (remaining stays in contract)
     */
    payBounty(repoOwnerSig, certServerSig, userPubKey, amount) {
        // 1) Check the repoOwner's signature for authorization
        assert(this.checkSig(repoOwnerSig, this.repoOwner), 'Repository owner signature invalid');
        // 2) Check certificate server signature to verify GitHub identity TODO
        assert(this.checkSig(certServerSig, this.certServerKey), 'Certificate server signature invalid');
        // 3) Ensure sufficient funds
        assert(amount <= this.ctx.utxo.value, 'Insufficient funds');
        // 4) Pay the developer
        const devAddr = pubKey2Addr(userPubKey);
        let outputs = Utils.buildPublicKeyHashOutput(devAddr, amount);
        // 5) Return remaining funds to the contract
        const remaining = this.ctx.utxo.value - amount;
        if (remaining > 0n) {
            outputs += this.buildStateOutput(remaining);
        }
        // Add change output
        outputs += this.buildChangeOutput();
        // Verify outputs hash matches
        assert(hash256(outputs) == this.ctx.hashOutputs, 'hashOutputs mismatch');
    }
    /**
     * Allow the repo owner to withdraw funds if needed
     */
    withdraw(repoOwnerSig, amount) {
        // Check signature
        assert(this.checkSig(repoOwnerSig, this.repoOwner), 'Invalid repository owner signature');
        // Ensure sufficient funds
        assert(amount <= this.ctx.utxo.value, 'Not enough funds');
        // Pay the repo owner
        const ownerAddr = pubKey2Addr(this.repoOwner);
        let outputs = Utils.buildPublicKeyHashOutput(ownerAddr, amount);
        // Return remaining funds to the contract
        const remaining = this.ctx.utxo.value - amount;
        if (remaining > 0n) {
            outputs += this.buildStateOutput(remaining);
        }
        // Add change output
        outputs += this.buildChangeOutput();
        // Verify outputs hash matches
        assert(hash256(outputs) == this.ctx.hashOutputs, 'hashOutputs mismatch');
    }
}
__decorate([
    prop(true),
    __metadata("design:type", String)
], BountyContract.prototype, "repoOwner", void 0);
__decorate([
    prop(true),
    __metadata("design:type", String)
], BountyContract.prototype, "certServerKey", void 0);
__decorate([
    prop(),
    __metadata("design:type", String)
], BountyContract.prototype, "repoOwnerName", void 0);
__decorate([
    prop(),
    __metadata("design:type", String)
], BountyContract.prototype, "repoName", void 0);
__decorate([
    prop(),
    __metadata("design:type", BigInt)
], BountyContract.prototype, "issueNumber", void 0);
__decorate([
    method(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BountyContract.prototype, "addFunds", null);
__decorate([
    method(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, BigInt]),
    __metadata("design:returntype", void 0)
], BountyContract.prototype, "payBounty", null);
__decorate([
    method(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, BigInt]),
    __metadata("design:returntype", void 0)
], BountyContract.prototype, "withdraw", null);
//# sourceMappingURL=BountyContract.js.map