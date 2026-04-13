/**
 * Tiny "time ago" formatter for transaction timestamps.
 * Avoids pulling in a full date library.
 */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Convert a Unix epoch timestamp (seconds) to a relative "time ago" string.
 * @param {number} epochSeconds
 * @returns {string}
 */
export function timeAgo(epochSeconds) {
  if (!epochSeconds) return '';

  const now = Math.floor(Date.now() / 1000);
  const diff = now - epochSeconds;

  if (diff < 0) return 'just now';
  if (diff < MINUTE) return `${diff}s ago`;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`;
  return `${Math.floor(diff / YEAR)}y ago`;
}

/**
 * Format a Unix epoch timestamp to a locale date string.
 * @param {number} epochSeconds
 * @returns {string}
 */
export function formatDate(epochSeconds) {
  if (!epochSeconds) return '';
  return new Date(epochSeconds * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a Unix epoch timestamp to a locale date+time string.
 * @param {number} epochSeconds
 * @returns {string}
 */
export function formatDateTime(epochSeconds) {
  if (!epochSeconds) return '';
  return new Date(epochSeconds * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
