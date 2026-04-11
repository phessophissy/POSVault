// SDK event subscription manager — Module 5
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_18_5 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_18_5: Config_18_5 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_18_5(config?: Partial<Config_18_5>): Config_18_5 {
  const merged = { ...defaultConfig_18_5, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_18_5(config: Config_18_5): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_18_5(config: Config_18_5): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_18_5(config);
  return { success: config.enabled, data: addr };
}
