/**
 * POSVault — Stacks Blockchain Integration Utilities
 * Uses @stacks/connect for wallet interactions
 * Uses @stacks/transactions for contract calls
 */

import { showConnect, openContractCall } from '@stacks/connect';
import {
    uintCV,
    principalCV,
    stringUtf8CV,
    stringAsciiCV,
    boolCV,
    cvToJSON,
    fetchCallReadOnlyFunction,
    PostConditionMode,
    Pc,
} from '@stacks/transactions';
import { STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

// ==========================================
// Configuration
// ==========================================

// Use testnet by default - change to mainnet for production
const IS_MAINNET = false;
const NETWORK = IS_MAINNET ? STACKS_MAINNET : STACKS_TESTNET;

// Contract deployer address — will be set upon deployment
export const CONTRACT_DEPLOYER = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// Contract names
export const CONTRACTS = {
    VAULT_CORE: 'vault-core',
    GOVERNANCE_TOKEN: 'governance-token',
    PROPOSAL_VOTING: 'proposal-voting',
};

// ==========================================
// Wallet Connection (@stacks/connect)
// ==========================================

/**
 * Connect wallet using @stacks/connect
 * @param {Function} onFinish - Callback after successful connection
 * @param {Function} onCancel - Callback if user cancels
 */
export function connectWallet(onFinish, onCancel) {
    showConnect({
        appDetails: {
            name: 'POSVault',
            icon: window.location.origin + '/favicon.svg',
        },
        redirectTo: '/',
        onFinish: (payload) => {
            const { userSession } = payload;
            const userData = userSession.loadUserData();
            const stxAddress = IS_MAINNET
                ? userData.profile.stxAddress.mainnet
                : userData.profile.stxAddress.testnet;

            onFinish({
                address: stxAddress,
                userData,
                userSession,
            });
        },
        onCancel: () => {
            if (onCancel) onCancel();
        },
        userSession: undefined,
    });
}

/**
 * Disconnect wallet
 * @param {object} userSession
 */
export function disconnectWallet(userSession) {
    if (userSession) {
        userSession.signUserOut('/');
    }
}

// ==========================================
// Contract Read-Only Calls (@stacks/transactions)
// ==========================================

/**
 * Call a read-only function on a contract
 * @param {string} contractName
 * @param {string} functionName
 * @param {Array} functionArgs
 * @param {string} senderAddress
 */
export async function callReadOnly(contractName, functionName, functionArgs = [], senderAddress) {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_DEPLOYER,
            contractName,
            functionName,
            functionArgs,
            network: NETWORK,
            senderAddress: senderAddress || CONTRACT_DEPLOYER,
        });
        return cvToJSON(result);
    } catch (error) {
        console.error(`Read-only call failed: ${contractName}.${functionName}`, error);
        throw error;
    }
}

/**
 * Get vault information
 */
export async function getVaultInfo(senderAddress) {
    return callReadOnly(CONTRACTS.VAULT_CORE, 'get-vault-info', [], senderAddress);
}

/**
 * Get user deposit
 */
export async function getUserDeposit(userAddress) {
    return callReadOnly(
        CONTRACTS.VAULT_CORE,
        'get-deposit',
        [principalCV(userAddress)],
        userAddress
    );
}

/**
 * Get user stats
 */
export async function getUserStats(userAddress) {
    return callReadOnly(
        CONTRACTS.VAULT_CORE,
        'get-user-stats',
        [principalCV(userAddress)],
        userAddress
    );
}

/**
 * Get pending rewards
 */
export async function getPendingRewards(userAddress) {
    return callReadOnly(
        CONTRACTS.VAULT_CORE,
        'get-pending-rewards',
        [principalCV(userAddress)],
        userAddress
    );
}

/**
 * Get governance token balance
 */
export async function getTokenBalance(userAddress) {
    return callReadOnly(
        CONTRACTS.GOVERNANCE_TOKEN,
        'get-balance',
        [principalCV(userAddress)],
        userAddress
    );
}

/**
 * Get total token supply
 */
export async function getTotalSupply(senderAddress) {
    return callReadOnly(CONTRACTS.GOVERNANCE_TOKEN, 'get-total-supply', [], senderAddress);
}

/**
 * Get proposal
 */
export async function getProposal(proposalId, senderAddress) {
    return callReadOnly(
        CONTRACTS.PROPOSAL_VOTING,
        'get-proposal',
        [uintCV(proposalId)],
        senderAddress
    );
}

/**
 * Get proposal count
 */
export async function getProposalCount(senderAddress) {
    return callReadOnly(CONTRACTS.PROPOSAL_VOTING, 'get-proposal-count', [], senderAddress);
}

// ==========================================
// Contract Write Calls (@stacks/connect + @stacks/transactions)
// ==========================================

/**
 * Generic function to open a contract call via Stacks wallet
 * @param {string} contractName
 * @param {string} functionName
 * @param {Array} functionArgs
 * @param {Array} postConditions
 * @param {Function} onFinish
 * @param {Function} onCancel
 */
export function executeContractCall({
    contractName,
    functionName,
    functionArgs = [],
    postConditions = [],
    onFinish,
    onCancel,
}) {
    openContractCall({
        contractAddress: CONTRACT_DEPLOYER,
        contractName,
        functionName,
        functionArgs,
        postConditions,
        postConditionMode: PostConditionMode.Deny,
        network: NETWORK,
        appDetails: {
            name: 'POSVault',
            icon: window.location.origin + '/favicon.svg',
        },
        onFinish: (data) => {
            console.log('Transaction submitted:', data);
            if (onFinish) onFinish(data);
        },
        onCancel: () => {
            console.log('Transaction cancelled');
            if (onCancel) onCancel();
        },
    });
}

// ==========================================
// Vault Operations
// ==========================================

/**
 * Deposit STX into the vault
 * @param {number} amountInSTX - Amount to deposit (in STX, not microSTX)
 * @param {string} senderAddress - User's STX address
 * @param {Function} onFinish
 * @param {Function} onCancel
 */
export function depositSTX(amountInSTX, senderAddress, onFinish, onCancel) {
    const amountMicro = Math.floor(amountInSTX * 1000000);

    const postConditions = [
        Pc.principal(senderAddress).willSendEq(amountMicro).ustx(),
    ];

    executeContractCall({
        contractName: CONTRACTS.VAULT_CORE,
        functionName: 'deposit',
        functionArgs: [uintCV(amountMicro)],
        postConditions,
        onFinish,
        onCancel,
    });
}

/**
 * Withdraw STX from the vault
 */
export function withdrawSTX(onFinish, onCancel) {
    executeContractCall({
        contractName: CONTRACTS.VAULT_CORE,
        functionName: 'withdraw',
        functionArgs: [],
        postConditions: [],
        onFinish,
        onCancel,
    });
}

/**
 * Claim POS-GOV rewards
 */
export function claimRewards(onFinish, onCancel) {
    executeContractCall({
        contractName: CONTRACTS.VAULT_CORE,
        functionName: 'claim-rewards',
        functionArgs: [],
        postConditions: [],
        onFinish,
        onCancel,
    });
}

// ==========================================
// Governance Operations
// ==========================================

/**
 * Create a proposal
 */
export function createProposal(title, description, proposalType, value, onFinish, onCancel) {
    executeContractCall({
        contractName: CONTRACTS.PROPOSAL_VOTING,
        functionName: 'create-proposal',
        functionArgs: [
            stringUtf8CV(title),
            stringUtf8CV(description),
            stringAsciiCV(proposalType),
            uintCV(value),
        ],
        postConditions: [],
        onFinish,
        onCancel,
    });
}

/**
 * Vote on a proposal
 */
export function voteOnProposal(proposalId, support, onFinish, onCancel) {
    executeContractCall({
        contractName: CONTRACTS.PROPOSAL_VOTING,
        functionName: 'vote',
        functionArgs: [uintCV(proposalId), boolCV(support)],
        postConditions: [],
        onFinish,
        onCancel,
    });
}

/**
 * Execute a proposal
 */
export function executeProposal(proposalId, onFinish, onCancel) {
    executeContractCall({
        contractName: CONTRACTS.PROPOSAL_VOTING,
        functionName: 'execute-proposal',
        functionArgs: [uintCV(proposalId)],
        postConditions: [],
        onFinish,
        onCancel,
    });
}

// ==========================================
// Utility
// ==========================================

export function formatSTX(microSTX) {
    if (!microSTX && microSTX !== 0) return '0.000000';
    return (Number(microSTX) / 1000000).toFixed(6);
}

export function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString();
}
