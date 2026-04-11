/**
 * Event types and helpers for tracking POSVault transactions.
 */

export type TransactionEventType =
  | 'deposit'
  | 'withdraw'
  | 'claim-rewards'
  | 'create-proposal'
  | 'vote'
  | 'execute-proposal'
  | 'set-reward-rate'
  | 'toggle-pause'
  | 'transfer-token'
  | 'burn-token';

export interface TransactionEvent {
  type: TransactionEventType;
  txid: string;
  sender: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface DepositEvent extends TransactionEvent {
  type: 'deposit';
  metadata: { amount: bigint };
}

export interface WithdrawEvent extends TransactionEvent {
  type: 'withdraw';
  metadata: { stxReturned: bigint; rewardsEarned: bigint };
}

export interface VoteEvent extends TransactionEvent {
  type: 'vote';
  metadata: { proposalId: bigint; support: boolean };
}

export function createTransactionEvent(
  type: TransactionEventType,
  txid: string,
  sender: string,
  metadata?: Record<string, unknown>
): TransactionEvent {
  return {
    type,
    txid,
    sender,
    timestamp: Date.now(),
    status: 'pending',
    metadata,
  };
}

export function isDepositEvent(event: TransactionEvent): event is DepositEvent {
  return event.type === 'deposit';
}

export function isWithdrawEvent(event: TransactionEvent): event is WithdrawEvent {
  return event.type === 'withdraw';
}

export function isVoteEvent(event: TransactionEvent): event is VoteEvent {
  return event.type === 'vote';
}
