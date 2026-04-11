import { useState, useEffect, useCallback } from 'react';
import {
  getVaultInfo,
  getUserDeposit,
  getUserStats,
  getPendingRewards,
  getTokenBalance,
  getTotalSupply,
  getProposalCount,
} from './stacks.js';

export default function useVaultData(walletAddress, refreshInterval = 30000) {
  const [data, setData] = useState({
    vaultInfo: null,
    deposit: null,
    stats: null,
    pendingRewards: 0,
    tokenBalance: 0,
    totalSupply: 0,
    proposalCount: 0,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const [vaultInfo, totalSupply, proposalCount] = await Promise.all([
        getVaultInfo(walletAddress || 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09'),
        getTotalSupply(walletAddress || 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09'),
        getProposalCount(walletAddress || 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09'),
      ]);

      let deposit = null, stats = null, pendingRewards = 0, tokenBalance = 0;
      if (walletAddress) {
        [deposit, stats, pendingRewards, tokenBalance] = await Promise.all([
          getUserDeposit(walletAddress),
          getUserStats(walletAddress),
          getPendingRewards(walletAddress),
          getTokenBalance(walletAddress),
        ]);
      }

      setData({
        vaultInfo, deposit, stats, pendingRewards, tokenBalance,
        totalSupply, proposalCount, loading: false, error: null,
      });
    } catch (error) {
      setData(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { ...data, refresh: fetchData };
}
