export function shortHash(value, left = 10, right = 6) {
  const str = String(value || '');
  if (!str) return '';
  if (str.length <= left + right + 3) return str;
  return `${str.slice(0, left)}...${str.slice(-right)}`;
}
