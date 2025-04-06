import { BSVWallet } from '@bsv/sdk';
import { MultiSigEscrow } from '../contracts/MultiSigEscrow.js';
interface TransactionResponse {
    txid: string;
    amount?: number;
}
declare const initializeWallet: () => Promise<BSVWallet>;
declare const createBountyEscrow: (bountyId: string, funderAddr: string, solverAddr: string, arbiterAddr: string, // Server acts as arbiter
deadlineTimestamp: number) => Promise<MultiSigEscrow>;
declare const lockFundsInEscrow: (escrow: MultiSigEscrow, amount: number) => Promise<TransactionResponse>;
declare const releaseFundsToSolver: (escrow: MultiSigEscrow, txid: string, outputIndex: number) => Promise<TransactionResponse>;
declare const refundToFunder: (escrow: MultiSigEscrow, txid: string, outputIndex: number) => Promise<TransactionResponse>;
export { initializeWallet, createBountyEscrow, lockFundsInEscrow, releaseFundsToSolver, refundToFunder };
