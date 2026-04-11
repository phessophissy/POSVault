// SDK event subscription manager — Module 2
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_18_2 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_18_2: Config_18_2 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_18_2(config?: Partial<Config_18_2>): Config_18_2 {
  const merged = { ...defaultConfig_18_2, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_18_2(config: Config_18_2): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_18_2(config: Config_18_2): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_18_2(config);
  return { success: config.enabled, data: addr };
}
