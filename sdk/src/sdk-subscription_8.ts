// SDK event subscription manager — Module 8
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_18_8 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_18_8: Config_18_8 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_18_8(config?: Partial<Config_18_8>): Config_18_8 {
  const merged = { ...defaultConfig_18_8, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_18_8(config: Config_18_8): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_18_8(config: Config_18_8): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_18_8(config);
  return { success: config.enabled, data: addr };
}
