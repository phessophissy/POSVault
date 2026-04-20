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

/** Parse CLI arguments */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    network: "mainnet",
    verbose: false,
    output: "console",
    interval: 60000,
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--network": options.network = args[++i]; break;
      case "--verbose": options.verbose = true; break;
      case "--output": options.output = args[++i]; break;
      case "--interval": options.interval = parseInt(args[++i]); break;
    }
  }
  return options;
}

/** Format timestamp */
function formatTime(date = new Date()) {
  return date.toISOString().replace("T", " ").substring(0, 19);
}

/** Log with timestamp */
function log(message, level = "INFO") {
  console.log(`[${formatTime()}] [${level}] ${message}`);
}

/** Log error */
function logError(message) {
  log(message, "ERROR");
}

/** Calculate basic statistics */
function calculateStats(values) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, sum: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    sum,
    count: values.length,
  };
}

/** Format STX amount */
function formatSTX(microSTX) {
  return (Number(microSTX) / 1000000).toFixed(6) + " STX";
}

/** Format number with commas */
function formatNumber(num) {
  return Number(num).toLocaleString();
}

/** Format percentage */
function formatPercent(value) {
  return (value * 100).toFixed(2) + "%";
}

/** Check vault health status */
async function checkHealth() {
  const checks = [];

  // Check 1: API responsiveness
  try {
    const start = Date.now();
    await getVaultInfo();
    const latency = Date.now() - start;
    checks.push({ name: "API Latency", status: latency < 5000 ? "OK" : "WARN", value: `${latency}ms` });
  } catch (err) {
    checks.push({ name: "API Latency", status: "FAIL", value: err.message });
  }

  return checks;
}

/** Generate report */
function generateReport(checks) {
  log("=== Vault Health Report ===");
  log(`Timestamp: ${formatTime()}`);
  log(`Contract: ${VAULT_CONTRACT}`);
  log("");
  for (const check of checks) {
    const icon = check.status === "OK" ? "✓" : check.status === "WARN" ? "!" : "✗";
    log(`  [${icon}] ${check.name}: ${check.value} (${check.status})`);
  }
  log("");
  const passed = checks.filter(c => c.status === "OK").length;
  log(`Summary: ${passed}/${checks.length} checks passed`);
}

/** Retry helper */
async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      logError(`Attempt ${i + 1} failed: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2; // exponential backoff
    }
  }
}

/** Rate limit helper */
function createRateLimiter(maxRequests, windowMs) {
  const timestamps = [];
  return async function rateLimited(fn) {
    const now = Date.now();
    const windowStart = now - windowMs;
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift();
    }
    if (timestamps.length >= maxRequests) {
      const waitTime = timestamps[0] + windowMs - now;
      await new Promise(r => setTimeout(r, waitTime));
    }
    timestamps.push(Date.now());
    return fn();
  };
}

/** Output formatter */
function formatOutput(data, format = "console") {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "csv":
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(r => Object.values(r).join(","));
        return [headers, ...rows].join("\n");
      }
      return "";
    default:
      return typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
  }
}

/** Validate configuration */
function validateConfig(options) {
  const errors = [];
  if (!["mainnet", "testnet"].includes(options.network)) {
    errors.push(`Invalid network: ${options.network}`);
  }
  if (options.interval < 10000) {
    errors.push("Interval must be at least 10 seconds");
  }
  if (errors.length > 0) {
    errors.forEach(e => logError(e));
    process.exit(1);
  }
}
