/**
 * Formatting utilities for the POSVault frontend.
 */

export function formatSTXAmount(microStx) {
  const stx = Number(microStx) / 1_000_000;
  if (stx >= 1_000_000) return `${(stx / 1_000_000).toFixed(2)}M`;
  if (stx >= 1_000) return `${(stx / 1_000).toFixed(2)}K`;
  return stx.toFixed(6);
}

export function formatTokenAmount(rawAmount, decimals = 6) {
  const value = Number(rawAmount) / Math.pow(10, decimals);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatPercent(value, total) {
  if (!total || total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
}

export function shortAddress(addr, chars = 4) {
  if (!addr || addr.length <= chars * 2 + 3) return addr || '';
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function timeAgo(blockHeight, currentBlock, avgBlockTime = 600) {
  const blocksDiff = currentBlock - blockHeight;
  const seconds = blocksDiff * avgBlockTime;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function explorerTxUrl(txid) {
  return `https://explorer.hiro.so/txid/${txid}?chain=mainnet`;
}

export function explorerAddressUrl(address) {
  return `https://explorer.hiro.so/address/${address}?chain=mainnet`;
}
