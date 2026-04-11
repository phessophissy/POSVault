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

/** Utility function 7-1: number formatting */
export function helper_7_1(input: string | number): string {
  const value = typeof input === 'number' ? input : parseFloat(input);
  if (isNaN(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/** Utility function 7-2: number formatting */
export function helper_7_2(input: string | number): string {
  const value = typeof input === 'number' ? input : parseFloat(input);
  if (isNaN(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/** Utility function 7-3: number formatting */
export function helper_7_3(input: string | number): string {
  const value = typeof input === 'number' ? input : parseFloat(input);
  if (isNaN(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/** Utility function 7-4: number formatting */
export function helper_7_4(input: string | number): string {
  const value = typeof input === 'number' ? input : parseFloat(input);
  if (isNaN(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/** Utility function 7-5: number formatting */
export function helper_7_5(input: string | number): string {
  const value = typeof input === 'number' ? input : parseFloat(input);
  if (isNaN(value)) return '0';
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}
