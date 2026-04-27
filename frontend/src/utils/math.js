export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function percentage(part, total) {
  if (!total || total <= 0) return 0;
  return (toNumber(part) / toNumber(total)) * 100;
}

export function projectRewards(amountStx, rewardRateBps, cycles) {
  const amount = toNumber(amountStx, 0);
  const rate = toNumber(rewardRateBps, 0) / 10000;
  const cycleCount = Math.max(0, Math.floor(toNumber(cycles, 0)));
  return amount * rate * cycleCount;
}

export function lerp(a, b, t) {
  return toNumber(a) + (toNumber(b) - toNumber(a)) * clamp(toNumber(t), 0, 1);
}
