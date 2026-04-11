#!/usr/bin/env node
// Vault monitoring and alerting scripts — Check 2

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

async function runCheck2() {
  const blockInfo = await fetch(`${API_BASE}/v2/info`).then(r => r.json());
  console.log("[Check] Current block:", blockInfo.stacks_tip_height);
}

runCheck2().catch(err => {
  console.error(`[Check 2] Failed:`, err.message);
  process.exit(1);
});
