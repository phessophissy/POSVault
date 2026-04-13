import { useState, useEffect, useCallback, useRef } from 'react';

const PAGE_SIZE = 20;

/**
 * @typedef {'all' | 'contract_call' | 'token_transfer' | 'smart_contract'} TxTypeFilter
 * @typedef {'all' | 'success' | 'pending' | 'failed'} TxStatusFilter
 */

/**
 * Hook to fetch, filter, and paginate on-chain transaction history
 * for a given Stacks address.
 *
 * @param {string|null} userAddress
 * @param {string} apiBaseUrl  Hiro API base URL
 */
export function useTransactionHistory(userAddress, apiBaseUrl) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const abortRef = useRef(null);

  const fetchPage = useCallback(
    async (pageNum, append = false) => {
      if (!userAddress || !apiBaseUrl) return;

      // Abort any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const offset = pageNum * PAGE_SIZE;
        const url = new URL(
          `/extended/v1/address/${userAddress}/transactions`,
          apiBaseUrl,
        );
        url.searchParams.set('limit', String(PAGE_SIZE));
        url.searchParams.set('offset', String(offset));

        const res = await fetch(url.toString(), {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        const results = data.results ?? [];

        setHasMore(offset + results.length < (data.total ?? 0));

        if (append) {
          setTransactions((prev) => [...prev, ...results]);
        } else {
          setTransactions(results);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [userAddress, apiBaseUrl],
  );

  // Reset and fetch when address changes
  useEffect(() => {
    setPage(0);
    setTransactions([]);
    fetchPage(0);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [userAddress, apiBaseUrl, fetchPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchPage(0);
  }, [fetchPage]);

  // Client-side filtering
  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.tx_type !== typeFilter) return false;
    if (statusFilter === 'success' && tx.tx_status !== 'success') return false;
    if (statusFilter === 'pending' && tx.tx_status !== 'pending') return false;
    if (
      statusFilter === 'failed' &&
      tx.tx_status !== 'abort_by_response' &&
      tx.tx_status !== 'abort_by_post_condition'
    )
      return false;
    return true;
  });

  return {
    transactions: filtered,
    allTransactions: transactions,
    loading,
    error,
    hasMore,
    page,
    typeFilter,
    statusFilter,
    setTypeFilter,
    setStatusFilter,
    loadMore,
    refresh,
  };
}
