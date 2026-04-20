import React, { useState, useEffect } from "react";

/**
 * TransactionFeed Component
 * Provides vault interaction UI for POSVault protocol
 */

const VAULT_CONTRACT = "SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09.vault-core-v4";

/** Format micro-STX to human readable */
function formatSTX(micro) {
  return (Number(micro) / 1000000).toFixed(6);
}

/** Format address for display */
function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
