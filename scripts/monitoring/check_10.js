#!/usr/bin/env node
// Vault monitoring and alerting scripts — Check 10

const API_BASE = 'https://api.hiro.so';
const DEPLOYER = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';
const VAULT = 'vault-core-v4';

async function readContract(fn, args = []) {
  const url = `${API_BASE}/v2/contracts/call-read/${DEPLOYER}/${VAULT}/${fn}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: DEPLOYER, arguments: args }),
  });
  return res.json();
}

async function runCheck10() {
  const info = await readContract("get-vault-info");
  console.log("[Check] Total STX locked:", info.result);
  if (!info.result) console.error("WARNING: Could not read vault info");
}

runCheck10().catch(err => {
  console.error(`[Check 10] Failed:`, err.message);
  process.exit(1);
});
