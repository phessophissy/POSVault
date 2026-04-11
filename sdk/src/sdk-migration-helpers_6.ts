// SDK contract migration utility helpers — Module 6
import { DEPLOYER, CONTRACT_NAMES } from './constants.js';

export interface Config_21_6 {
  deployer: string;
  network: 'mainnet' | 'testnet';
  enabled: boolean;
}

export const defaultConfig_21_6: Config_21_6 = {
  deployer: DEPLOYER,
  network: 'mainnet',
  enabled: true,
};

export function setup_21_6(config?: Partial<Config_21_6>): Config_21_6 {
  const merged = { ...defaultConfig_21_6, ...config };
  if (!merged.deployer) throw new Error('Deployer required');
  return merged;
}

export function getContractAddress_21_6(config: Config_21_6): string {
  return `${config.deployer}.${CONTRACT_NAMES.vaultCore}`;
}

export async function execute_21_6(config: Config_21_6): Promise<{ success: boolean; data: string }> {
  const addr = getContractAddress_21_6(config);
  return { success: config.enabled, data: addr };
}
