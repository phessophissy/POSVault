// SDK contract migration utility helpers — Module 2
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_21_2 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_21_2: Config_21_2 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_21_2(config?: Partial<Config_21_2>): Config_21_2 {
  const merged = { ...defaultConfig_21_2, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_21_2(config: Config_21_2): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_21_2(config: Config_21_2): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_21_2(config);
  return { success: config.enabled, data: addr };
}
