#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import {
  AnchorMode,
  PostConditionMode,
  bufferCVFromString,
  broadcastTransaction,
  cvToString,
  fetchCallReadOnlyFunction,
  getAddressFromPrivateKey,
  makeContractCall,
  noneCV,
  principalCV,
  someCV,
  uintCV,
} from '@stacks/transactions';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_WALLET_FILE = path.join(SCRIPT_DIR, 'wallets-set-2.json');
const DEFAULT_ENV_FILE = path.join(process.cwd(), '.env');
const DEFAULT_DELAY_MS = 1500;
const DEFAULT_MAX_DERIVATION_INDEX = 50;
const CURL_STATUS_MARKER = '__POSVAULT_STATUS__';

const NETWORK = 'mainnet';
const API_BASE_URL = 'https://api.hiro.so';
const DEPLOYER = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';
const GOVERNANCE_TOKEN_CONTRACT = 'governance-token';

const execFile = promisify(execFileCallback);

function printHelp() {
  console.log(`POSVault governance token funding CLI

Usage:
  node scripts/fund-governance.js --amount-each <micro-pos-gov> [options]

Required:
  --amount-each <uint>  Amount of POS-GOV units sent per wallet (6 decimals)

Wallet selection options:
  --wallet-file <path>  Recipient wallet JSON file. Default: ${DEFAULT_WALLET_FILE}
  --start <index>       1-based wallet index to start from. Default: 1
  --limit <count>       Number of wallets to fund. Default: all from start

Execution options:
  --delay-ms <ms>       Delay between tx submissions. Default: ${DEFAULT_DELAY_MS}
  --fee <ustx>          Optional fee override per tx in microSTX
  --memo <ascii>        Optional transfer memo (max 34 ASCII chars)
  --dry-run             Print plan without broadcasting
  --yes                 Required for live mainnet broadcasts

Env options:
  --env-file <path>     Env file path. Default: ${DEFAULT_ENV_FILE}

Expected .env keys:
  FUNDING_WALLET_ADDRESS=<SP...>
  FUNDING_WALLET_MNEMONIC="<12 or 24 words>"
  FUNDING_WALLET_INDEX=0                    # optional
  FUNDING_DERIVATION_SCAN=50                # optional

Examples:
  node scripts/fund-governance.js --amount-each 1000000 --limit 100 --dry-run --yes
  node scripts/fund-governance.js --amount-each 1000000 --limit 100 --delay-ms 2000 --yes
`);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {};

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.slice(2).split('=');
    if (inlineValue !== undefined) {
      options[rawKey] = inlineValue;
      continue;
    }

    const next = args[i + 1];
    if (!next || next.startsWith('--')) {
      options[rawKey] = true;
      continue;
    }

    options[rawKey] = next;
    i += 1;
  }

  return options;
}

function parsePositiveInt(value, flagName) {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected ${flagName} to be a positive integer`);
  }
  return parsed;
}

function parseNonNegativeInt(value, flagName) {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Expected ${flagName} to be a non-negative integer`);
  }
  return parsed;
}

function parseUint(value, flagName) {
  if (value === undefined) {
    throw new Error(`Missing required ${flagName}`);
  }
  if (!/^\d+$/.test(String(value))) {
    throw new Error(`Expected ${flagName} to be an unsigned integer`);
  }
  return BigInt(value);
}

function parseFee(value) {
  if (value === undefined) return undefined;
  if (!/^\d+$/.test(String(value))) {
    throw new Error('Expected --fee to be an unsigned integer in microSTX');
  }
  return BigInt(value);
}

function parseEnv(text) {
  const env = {};
  const lines = text.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

async function loadEnvFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return parseEnv(raw);
}

async function loadWalletFile(walletFilePath) {
  const raw = await readFile(walletFilePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || !Array.isArray(parsed.wallets)) {
    throw new Error(`Wallet file ${walletFilePath} does not contain a wallets array`);
  }

  return parsed.wallets.map((wallet, idx) => ({
    index: Number(wallet.index ?? idx + 1),
    address: String(wallet.address),
  }));
}

function selectWallets(wallets, options) {
  const start = parsePositiveInt(options.start ?? 1, '--start') ?? 1;
  const limit = parsePositiveInt(options.limit, '--limit');
  const startIndex = start - 1;
  if (startIndex >= wallets.length) return [];
  return wallets.slice(startIndex, limit ? startIndex + limit : undefined);
}

function normalizeBody(body) {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'string') return body;
  if (body instanceof Uint8Array) return Buffer.from(body).toString('utf8');
  return String(body);
}

async function curlFetch(url, init = {}) {
  const args = ['-sS', '-L', '-X', init.method ?? 'GET'];
  const headers = new Headers(init.headers ?? {});
  for (const [key, value] of headers.entries()) {
    args.push('-H', `${key}: ${value}`);
  }

  const body = normalizeBody(init.body);
  if (body !== undefined) {
    args.push('--data-binary', body);
  }

  args.push('-w', `\n${CURL_STATUS_MARKER}:%{http_code}`, url);

  const { stdout } = await execFile('curl', args, {
    maxBuffer: 10 * 1024 * 1024,
  });

  const markerIndex = stdout.lastIndexOf(`\n${CURL_STATUS_MARKER}:`);
  if (markerIndex === -1) {
    throw new Error(`curl response missing status marker for ${url}`);
  }

  const responseBody = stdout.slice(0, markerIndex);
  const status = Number(stdout.slice(markerIndex + CURL_STATUS_MARKER.length + 2).trim());

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: '',
    text: async () => responseBody,
    json: async () => JSON.parse(responseBody),
  };
}

const API_CLIENT = {
  baseUrl: API_BASE_URL,
  fetch: curlFetch,
};

function derivePrivateKeyAtIndex(mnemonic, index) {
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const pathText = `m/44'/5757'/0'/0/${index}`;
  const child = root.derive(pathText);

  if (!child.privateKey) {
    throw new Error(`Unable to derive private key at path ${pathText}`);
  }

  const privateKeyHex = Buffer.from(child.privateKey).toString('hex');
  return {
    pathText,
    privateKeyHex: `${privateKeyHex}01`,
  };
}

function resolveFundingWallet(env) {
  const fundingAddress = env.FUNDING_WALLET_ADDRESS;
  const mnemonic = env.FUNDING_WALLET_MNEMONIC;

  if (!fundingAddress) {
    throw new Error('Missing FUNDING_WALLET_ADDRESS in env file');
  }
  if (!mnemonic) {
    throw new Error('Missing FUNDING_WALLET_MNEMONIC in env file');
  }
  if (!validateMnemonic(mnemonic, englishWordlist)) {
    throw new Error('FUNDING_WALLET_MNEMONIC is not a valid BIP39 mnemonic');
  }

  const explicitIndex = parseNonNegativeInt(env.FUNDING_WALLET_INDEX, 'FUNDING_WALLET_INDEX');
  const maxScan = parseNonNegativeInt(env.FUNDING_DERIVATION_SCAN, 'FUNDING_DERIVATION_SCAN')
    ?? DEFAULT_MAX_DERIVATION_INDEX;

  if (explicitIndex !== undefined) {
    const derived = derivePrivateKeyAtIndex(mnemonic, explicitIndex);
    const derivedAddress = getAddressFromPrivateKey(derived.privateKeyHex, NETWORK);
    if (derivedAddress !== fundingAddress) {
      throw new Error(
        `FUNDING_WALLET_INDEX mismatch: derived ${derivedAddress} at ${derived.pathText}, expected ${fundingAddress}`
      );
    }
    return { ...derived, fundingAddress, derivationIndex: explicitIndex };
  }

  for (let idx = 0; idx <= maxScan; idx += 1) {
    const derived = derivePrivateKeyAtIndex(mnemonic, idx);
    const derivedAddress = getAddressFromPrivateKey(derived.privateKeyHex, NETWORK);
    if (derivedAddress === fundingAddress) {
      return { ...derived, fundingAddress, derivationIndex: idx };
    }
  }

  throw new Error(
    `Unable to derive ${fundingAddress} within indexes 0..${maxScan}. Set FUNDING_WALLET_INDEX explicitly in .env`
  );
}

async function callTokenBalance(address) {
  const response = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: GOVERNANCE_TOKEN_CONTRACT,
    functionName: 'get-balance',
    functionArgs: [principalCV(address)],
    senderAddress: address,
    network: NETWORK,
    client: API_CLIENT,
  });

  const repr = cvToString(response);
  const match = repr.match(/^\(ok u(\d+)\)$/);
  if (!match) {
    throw new Error(`Unexpected get-balance response for ${address}: ${repr}`);
  }
  return BigInt(match[1]);
}

function ensureWriteConfirmed(options) {
  if (!options.yes) {
    throw new Error('Refusing to send mainnet transactions without --yes');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatExplorerLink(txid) {
  return `https://explorer.hiro.so/txid/${txid}?chain=mainnet`;
}

async function broadcastTransfer({
  senderAddress,
  senderPrivateKey,
  recipientAddress,
  amountEach,
  memo,
  fee,
}) {
  const functionArgs = [
    uintCV(amountEach),
    principalCV(senderAddress),
    principalCV(recipientAddress),
    memo ? someCV(bufferCVFromString(memo)) : noneCV(),
  ];

  const txOptions = {
    contractAddress: DEPLOYER,
    contractName: GOVERNANCE_TOKEN_CONTRACT,
    functionName: 'transfer',
    functionArgs,
    senderKey: senderPrivateKey,
    network: NETWORK,
    client: API_CLIENT,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  if (fee !== undefined) {
    txOptions.fee = fee;
  }

  const tx = await makeContractCall(txOptions);
  const result = await broadcastTransaction({
    transaction: tx,
    network: NETWORK,
    client: API_CLIENT,
  });

  if (result && typeof result === 'object' && 'txid' in result) {
    return { ok: true, txid: result.txid };
  }

  return {
    ok: false,
    error: typeof result === 'string' ? result : JSON.stringify(result),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const amountEach = parseUint(options['amount-each'], '--amount-each');
  const delayMs = parsePositiveInt(options['delay-ms'] ?? DEFAULT_DELAY_MS, '--delay-ms') ?? DEFAULT_DELAY_MS;
  const fee = parseFee(options.fee);
  const walletFile = String(options['wallet-file'] ?? DEFAULT_WALLET_FILE);
  const envFile = String(options['env-file'] ?? DEFAULT_ENV_FILE);
  const dryRun = Boolean(options['dry-run']);
  const memo = options.memo ? String(options.memo) : undefined;

  if (memo && (!/^[\x20-\x7E]*$/.test(memo) || memo.length > 34)) {
    throw new Error('Expected --memo to be ASCII with max length 34 chars');
  }

  if (!dryRun) {
    ensureWriteConfirmed(options);
  }

  const env = await loadEnvFile(envFile);
  const fundingWallet = resolveFundingWallet(env);
  const allWallets = await loadWalletFile(walletFile);
  const selectedWallets = selectWallets(allWallets, options)
    .filter(wallet => wallet.address !== fundingWallet.fundingAddress);

  if (selectedWallets.length === 0) {
    throw new Error('No recipient wallets matched the current selection');
  }

  const totalAmount = amountEach * BigInt(selectedWallets.length);

  console.log(`Env file: ${envFile}`);
  console.log(`Wallet file: ${walletFile}`);
  console.log(`Network: ${NETWORK}`);
  console.log(`Token contract: ${DEPLOYER}.${GOVERNANCE_TOKEN_CONTRACT}`);
  console.log(`Funding wallet: ${fundingWallet.fundingAddress}`);
  console.log(`Funding path: ${fundingWallet.pathText}`);
  console.log(`Selected recipients: ${selectedWallets.length}`);
  console.log(`Amount each (units): ${amountEach}`);
  console.log(`Total required (units): ${totalAmount}`);
  if (dryRun) {
    console.log('Mode: dry-run (no broadcasts)');
  }

  const fundingBalance = await callTokenBalance(fundingWallet.fundingAddress);
  console.log(`Funding balance (units): ${fundingBalance}`);
  if (fundingBalance < totalAmount) {
    throw new Error(
      `Insufficient funding balance: need ${totalAmount}, have ${fundingBalance}`
    );
  }

  const results = [];
  for (let i = 0; i < selectedWallets.length; i += 1) {
    const recipient = selectedWallets[i];
    console.log(`wallet ${recipient.index}: transfer to ${recipient.address}`);

    if (dryRun) {
      results.push({ ok: true, recipient, txid: 'dry-run' });
    } else {
      const result = await broadcastTransfer({
        senderAddress: fundingWallet.fundingAddress,
        senderPrivateKey: fundingWallet.privateKeyHex,
        recipientAddress: recipient.address,
        amountEach,
        memo,
        fee,
      });

      if (result.ok) {
        console.log(`  txid: ${result.txid}`);
        console.log(`  explorer: ${formatExplorerLink(result.txid)}`);
      } else {
        console.log(`  error: ${result.error}`);
      }
      results.push({ ...result, recipient });
    }

    if (i < selectedWallets.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const successes = results.filter(item => item.ok).length;
  const failures = results.length - successes;
  console.log(`\nfund-governance summary: ${successes} succeeded, ${failures} failed`);
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error.message);
  process.exitCode = 1;
});
