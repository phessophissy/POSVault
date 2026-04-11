// SDK contract migration utility helpers — Module 5
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_21_5 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_21_5: Config_21_5 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_21_5(config?: Partial<Config_21_5>): Config_21_5 {
  const merged = { ...defaultConfig_21_5, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_21_5(config: Config_21_5): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_21_5(config: Config_21_5): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_21_5(config);
  return { success: config.enabled, data: addr };
}
