#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const SENSITIVE_PATH_PATTERNS = [
  /(^|\/)\.env(\.|$)/i,
  /(^|\/)scripts\/wallets.*\.json$/i,
  /(^|\/)secrets?\//i,
  /(^|\/)keys?\//i,
  /(^|\/)credentials?\//i,
  /(^|\/)id_rsa(\.|$)/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.key$/i,
  /(^|\/)mnemonic/i,
  /(^|\/)private[-_]?key/i,
];

function getTrackedFiles() {
  const output = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
  return output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function main() {
  const trackedFiles = getTrackedFiles();
  const matches = trackedFiles.filter(filePath =>
    SENSITIVE_PATH_PATTERNS.some(pattern => pattern.test(filePath))
  );

  if (matches.length === 0) {
    console.log('OK: no sensitive-looking tracked file paths detected.');
    return;
  }

  console.error('ERROR: potentially sensitive tracked file paths detected:');
  for (const filePath of matches) {
    console.error(` - ${filePath}`);
  }
  console.error('Remove these files from version control and keep them ignored.');
  process.exitCode = 1;
}

main();
