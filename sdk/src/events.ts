export type EventType =
  | 'deposit'
  | 'withdraw'
  | 'claim-rewards'
  | 'set-reward-rate'
  | 'toggle-pause'
  | 'add-admin'
  | 'remove-admin'
  | 'create-proposal'
  | 'vote'
  | 'execute-proposal';

export interface VaultEvent {
  type: EventType;
  txid: string;
  sender: string;
  timestamp: number;
  blockHeight?: number;
  data?: Record<string, unknown>;
}

export function createEvent(type: EventType, txid: string, sender: string, data?: Record<string, unknown>): VaultEvent {
  return {
    type,
    txid,
    sender,
    timestamp: Date.now(),
    data,
  };
}

export function formatEventLog(event: VaultEvent): string {
  const time = new Date(event.timestamp).toISOString();
  const dataStr = event.data ? ` | ${JSON.stringify(event.data)}` : '';
  return `[${time}] ${event.type} by ${event.sender} (tx: ${event.txid.slice(0, 12)}...)${dataStr}`;
}
