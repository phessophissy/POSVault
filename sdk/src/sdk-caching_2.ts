// SDK response caching layer — Module 2
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_15_2 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_15_2: Config_15_2 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_15_2(config?: Partial<Config_15_2>): Config_15_2 {
  const merged = { ...defaultConfig_15_2, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_15_2(config: Config_15_2): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_15_2(config: Config_15_2): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_15_2(config);
  return { success: config.enabled, data: addr };
}
