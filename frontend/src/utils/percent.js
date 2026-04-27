export function formatPercent(value, digits = 2) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0.00%';
  return `${num.toFixed(digits)}%`;
}
