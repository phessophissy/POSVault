// SDK response caching layer — Module 1
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_15_1 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_15_1: Config_15_1 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_15_1(config?: Partial<Config_15_1>): Config_15_1 {
  const merged = { ...defaultConfig_15_1, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_15_1(config: Config_15_1): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_15_1(config: Config_15_1): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_15_1(config);
  return { success: config.enabled, data: addr };
}
