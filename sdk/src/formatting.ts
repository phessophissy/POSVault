import { TOKEN_DECIMALS, TOKEN_SYMBOL } from './constants.js';

export function formatSTX(microStx: number | bigint): string {
  const value = Number(microStx) / 1_000_000;
  return `${value.toFixed(6)} STX`;
}

export function formatToken(amount: number | bigint): string {
  const value = Number(amount) / Math.pow(10, TOKEN_DECIMALS);
  return `${value.toFixed(TOKEN_DECIMALS)} ${TOKEN_SYMBOL}`;
}

export function formatBasisPoints(bp: number | bigint): string {
  const pct = Number(bp) / 100;
  return `${pct.toFixed(2)}%`;
}

export function formatBlockDuration(blocks: number | bigint): string {
  const numBlocks = Number(blocks);
  const minutes = numBlocks * 10;
  if (minutes < 60) return `~${minutes} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `~${hours.toFixed(1)} hours`;
  const days = hours / 24;
  return `~${days.toFixed(1)} days`;
}

export function shortenTxId(txid: string): string {
  if (txid.length <= 16) return txid;
  return `${txid.slice(0, 8)}...${txid.slice(-8)}`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 5) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
