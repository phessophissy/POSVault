import { TOKEN_DECIMALS } from './constants.js';

export function stxToMicro(stx: number | string): bigint {
  return BigInt(Math.round(Number(stx) * 1_000_000));
}

export function microToStx(micro: number | bigint): string {
  const value = Number(micro);
  return (value / 1_000_000).toFixed(TOKEN_DECIMALS);
}

export function formatAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number | bigint): string {
  return Number(num).toLocaleString();
}

export function explorerUrl(txid: string, chain: 'mainnet' | 'testnet' = 'mainnet'): string {
  return `https://explorer.hiro.so/txid/${txid}?chain=${chain}`;
}
