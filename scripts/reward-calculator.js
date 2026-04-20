#!/usr/bin/env node
/**
 * Reward Calculator
 * POSVault utility script for vault monitoring and management
 */

import { execSync } from "child_process";

const DEPLOYER = "SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09";
const VAULT_CONTRACT = `${DEPLOYER}.vault-core-v4`;
const API_BASE = "https://api.hiro.so";

/** Fetch vault info via read-only call */
async function getVaultInfo() {
  const url = `${API_BASE}/v2/contracts/call-read/${DEPLOYER}/vault-core-v4/get-vault-info`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender: DEPLOYER, arguments: [] }),
  });
  if (!resp.ok) throw new Error(`API error: ${resp.status}`);
  return resp.json();
}
