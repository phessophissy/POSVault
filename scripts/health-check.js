#!/usr/bin/env node
/**
 * Health Check
 * POSVault utility script for vault monitoring and management
 */

import { execSync } from "child_process";

const DEPLOYER = "SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09";
const VAULT_CONTRACT = `${DEPLOYER}.vault-core-v4`;
const API_BASE = "https://api.hiro.so";
