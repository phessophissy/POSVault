// SDK contract migration utility helpers — Module 3
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_21_3 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_21_3: Config_21_3 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_21_3(config?: Partial<Config_21_3>): Config_21_3 {
  const merged = { ...defaultConfig_21_3, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_21_3(config: Config_21_3): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_21_3(config: Config_21_3): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_21_3(config);
  return { success: config.enabled, data: addr };
}
