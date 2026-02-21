import React, { useState, useEffect, useCallback } from 'react';
import {
    connectWallet,
    disconnectWallet,
    depositSTX,
    withdrawSTX,
    claimRewards,
    createProposal,
    voteOnProposal,
    executeProposal,
    getVaultInfo,
    getUserDeposit,
    getUserStats,
    getPendingRewards,
    getTokenBalance,
    getTotalSupply,
    getProposalCount,
    getProposal,
    formatSTX,
    formatAddress,
    formatNumber,
} from './stacks.js';

// ==========================================
// App Component
// ==========================================

export default function App() {
    const [activeTab, setActiveTab] = useState('vault');
    const [wallet, setWallet] = useState(null);
    const [txStatus, setTxStatus] = useState(null);

    // Vault state
    const [vaultInfo, setVaultInfo] = useState(null);
    const [userDeposit, setUserDeposit] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [pendingRewards, setPendingRewards] = useState(0);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);
    const [depositAmount, setDepositAmount] = useState('');

    // Governance state
    const [proposals, setProposals] = useState([]);
    const [proposalForm, setProposalForm] = useState({
        title: '', description: '', type: 'general', value: 0,
    });

    // ==========================================
    // Wallet Methods
    // ==========================================

    const handleConnect = useCallback(() => {
        connectWallet(
            (data) => {
                setWallet(data);
                setTxStatus({ type: 'success', message: `Connected: ${formatAddress(data.address)}` });
                setTimeout(() => setTxStatus(null), 3000);
            },
            () => {
                setTxStatus({ type: 'error', message: 'Connection cancelled' });
                setTimeout(() => setTxStatus(null), 3000);
            }
        );
    }, []);

    const handleDisconnect = useCallback(() => {
        if (wallet?.userSession) {
            disconnectWallet(wallet.userSession);
        }
        setWallet(null);
        setUserDeposit(null);
        setUserStats(null);
        setPendingRewards(0);
        setTokenBalance(0);
    }, [wallet]);

    // ==========================================
    // Data Fetching
    // ==========================================

    const refreshData = useCallback(async () => {
        try {
            const addr = wallet?.address;

            // Vault info (public, no wallet needed)
            try {
                const vault = await getVaultInfo(addr);
                if (vault?.value) setVaultInfo(vault.value);
            } catch (e) { console.log('Vault info fetch skipped (not deployed yet)'); }

            // Token supply
            try {
                const supply = await getTotalSupply(addr);
                if (supply?.value?.value) setTotalSupply(supply.value.value);
            } catch (e) { /* skip */ }

            if (addr) {
                try {
                    const deposit = await getUserDeposit(addr);
                    setUserDeposit(deposit?.value || null);
                } catch (e) { /* skip */ }

                try {
                    const stats = await getUserStats(addr);
                    if (stats?.value) setUserStats(stats.value);
                } catch (e) { /* skip */ }

                try {
                    const rewards = await getPendingRewards(addr);
                    if (rewards?.value?.value) setPendingRewards(rewards.value.value);
                } catch (e) { /* skip */ }

                try {
                    const balance = await getTokenBalance(addr);
                    if (balance?.value?.value) setTokenBalance(balance.value.value);
                } catch (e) { /* skip */ }
            }

            // Proposals
            try {
                const countResult = await getProposalCount(addr);
                const count = parseInt(countResult?.value?.value || '0');
                const propList = [];
                for (let i = 1; i <= Math.min(count, 20); i++) {
                    try {
                        const p = await getProposal(i, addr);
                        if (p?.value) propList.push({ id: i, ...p.value });
                    } catch (e) { /* skip */ }
                }
                setProposals(propList);
            } catch (e) { /* skip */ }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, [wallet?.address]);

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, [refreshData]);

    // ==========================================
    // Transaction Handlers
    // ==========================================

    const showTx = (type, message) => {
        setTxStatus({ type, message });
        if (type !== 'pending') setTimeout(() => setTxStatus(null), 5000);
    };

    const handleDeposit = () => {
        if (!wallet) return handleConnect();
        const amount = parseFloat(depositAmount);
        if (!amount || amount <= 0) return showTx('error', 'Enter a valid amount');

        showTx('pending', 'Confirm deposit in your wallet...');
        depositSTX(
            amount,
            wallet.address,
            (data) => {
                showTx('success', `Deposit submitted! TX: ${data.txId?.slice(0, 12)}...`);
                setDepositAmount('');
                setTimeout(refreshData, 5000);
            },
            () => showTx('error', 'Deposit cancelled')
        );
    };

    const handleWithdraw = () => {
        if (!wallet) return;
        showTx('pending', 'Confirm withdrawal in your wallet...');
        withdrawSTX(
            (data) => {
                showTx('success', `Withdrawal submitted! TX: ${data.txId?.slice(0, 12)}...`);
                setTimeout(refreshData, 5000);
            },
            () => showTx('error', 'Withdrawal cancelled')
        );
    };

    const handleClaimRewards = () => {
        if (!wallet) return;
        showTx('pending', 'Confirm claim in your wallet...');
        claimRewards(
            (data) => {
                showTx('success', `Rewards claimed! TX: ${data.txId?.slice(0, 12)}...`);
                setTimeout(refreshData, 5000);
            },
            () => showTx('error', 'Claim cancelled')
        );
    };

    const handleCreateProposal = () => {
        if (!wallet) return handleConnect();
        if (!proposalForm.title.trim()) return showTx('error', 'Enter a proposal title');

        showTx('pending', 'Confirm proposal creation...');
        createProposal(
            proposalForm.title,
            proposalForm.description || 'No description provided',
            proposalForm.type,
            parseInt(proposalForm.value) || 0,
            (data) => {
                showTx('success', `Proposal created! TX: ${data.txId?.slice(0, 12)}...`);
                setProposalForm({ title: '', description: '', type: 'general', value: 0 });
                setTimeout(refreshData, 5000);
            },
            () => showTx('error', 'Proposal creation cancelled')
        );
    };

    const handleVote = (proposalId, support) => {
        if (!wallet) return handleConnect();
        showTx('pending', `Submitting ${support ? 'FOR' : 'AGAINST'} vote...`);
        voteOnProposal(
            proposalId,
            support,
            (data) => {
                showTx('success', `Vote cast! TX: ${data.txId?.slice(0, 12)}...`);
                setTimeout(refreshData, 5000);
            },
            () => showTx('error', 'Vote cancelled')
        );
    };

    const handleExecute = (proposalId) => {
        if (!wallet) return handleConnect();
        showTx('pending', 'Executing proposal...');
        executeProposal(
            proposalId,
            (data) => {
                showTx('success', `Proposal executed! TX: ${data.txId?.slice(0, 12)}...`);
                setTimeout(refreshData, 5000);
            },
            () => showTx('error', 'Execution cancelled')
        );
    };

    // ==========================================
    // Render
    // ==========================================

    return (
        <>
            <div className="app-background" />
            <div className="grid-overlay" />

            {/* Header */}
            <header className="header">
                <div className="header-inner">
                    <div className="logo">
                        <div className="logo-icon">P</div>
                        <span className="logo-text">POSVault</span>
                        <span className="logo-badge">Stacks L2</span>
                    </div>

                    <nav className="nav-tabs">
                        {['vault', 'governance', 'portfolio'].map((tab) => (
                            <button
                                key={tab}
                                id={`nav-${tab}`}
                                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'vault' ? '🔐 Vault' : tab === 'governance' ? '🗳️ Governance' : '📊 Portfolio'}
                            </button>
                        ))}
                    </nav>

                    {wallet ? (
                        <button id="btn-wallet-connected" className="btn-wallet connected" onClick={handleDisconnect}>
                            <span className="wallet-dot" />
                            {formatAddress(wallet.address)}
                        </button>
                    ) : (
                        <button id="btn-connect-wallet" className="btn-wallet" onClick={handleConnect}>
                            ⚡ Connect Wallet
                        </button>
                    )}
                </div>
            </header>

            {/* Transaction Status Toast */}
            {txStatus && (
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 24px 0' }}>
                    <div className={`tx-status ${txStatus.type}`}>
                        {txStatus.type === 'pending' && <span className="spinner" />}
                        {txStatus.type === 'success' && '✅'}
                        {txStatus.type === 'error' && '❌'}
                        {txStatus.message}
                    </div>
                </div>
            )}

            <main className="main-content">
                {/* Hero */}
                <section className="hero">
                    <div className="hero-btc-badge">₿ Powered by Bitcoin via Stacks</div>
                    <h1>Treasury Vault & DAO Governance</h1>
                    <p>
                        Deposit STX to earn POS-GOV governance tokens. Shape the protocol's future
                        through decentralized voting. Built on Stacks, secured by Bitcoin.
                    </p>
                </section>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card fade-in stagger-1">
                        <div className="stat-label">Total STX Locked</div>
                        <div className="stat-value">{formatSTX(vaultInfo?.['total-stx-locked']?.value || 0)}</div>
                        <div className="stat-sub">STX</div>
                    </div>
                    <div className="stat-card fade-in stagger-2">
                        <div className="stat-label">Depositors</div>
                        <div className="stat-value">{formatNumber(vaultInfo?.['total-depositors']?.value || 0)}</div>
                        <div className="stat-sub">Active vaults</div>
                    </div>
                    <div className="stat-card fade-in stagger-3">
                        <div className="stat-label">Reward Rate</div>
                        <div className="stat-value">{(parseInt(vaultInfo?.['reward-rate']?.value || 100) / 100).toFixed(2)}%</div>
                        <div className="stat-sub">per cycle</div>
                    </div>
                    <div className="stat-card fade-in stagger-4">
                        <div className="stat-label">POS-GOV Supply</div>
                        <div className="stat-value">{formatSTX(totalSupply)}</div>
                        <div className="stat-sub">tokens minted</div>
                    </div>
                </div>

                {/* ==================== VAULT TAB ==================== */}
                {activeTab === 'vault' && (
                    <div className="section-grid fade-in">
                        {/* Deposit Card */}
                        <div className="card">
                            <div className="card-title">
                                <div className="card-title-icon" style={{ background: 'rgba(247,147,26,0.15)' }}>🔒</div>
                                Deposit STX
                            </div>
                            <div className="form-group">
                                <label className="form-label">Amount (STX)</label>
                                <input
                                    id="input-deposit-amount"
                                    type="number"
                                    className="form-input"
                                    placeholder="0.000000"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                Earn POS-GOV tokens as yield on your deposited STX. Rewards accrue every ~144 blocks (~1 day).
                            </p>
                            <button
                                id="btn-deposit"
                                className="btn btn-primary btn-full"
                                onClick={handleDeposit}
                                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                            >
                                {wallet ? '🔐 Deposit STX' : '⚡ Connect Wallet to Deposit'}
                            </button>
                        </div>

                        {/* Withdraw / Claim Card */}
                        <div className="card">
                            <div className="card-title">
                                <div className="card-title-icon" style={{ background: 'rgba(46,204,113,0.15)' }}>💰</div>
                                Your Vault
                            </div>

                            {userDeposit ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                        <div>
                                            <div className="stat-label">Deposited</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-orange-light)' }}>
                                                {formatSTX(userDeposit?.amount?.value)} STX
                                            </div>
                                        </div>
                                        <div>
                                            <div className="stat-label">Pending Rewards</div>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>
                                                {formatSTX(pendingRewards)} POS-GOV
                                            </div>
                                        </div>
                                    </div>
                                    <div className="stat-label">Deposited at Block</div>
                                    <div className="mono" style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>
                                        #{userDeposit?.['deposit-block']?.value || '—'}
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button id="btn-claim" className="btn btn-success" style={{ flex: 1 }} onClick={handleClaimRewards}>
                                            🎁 Claim Rewards
                                        </button>
                                        <button id="btn-withdraw" className="btn btn-danger" style={{ flex: 1 }} onClick={handleWithdraw}>
                                            📤 Withdraw All
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏦</div>
                                    <p>No active deposit</p>
                                    <p style={{ fontSize: 13, marginTop: 8 }}>
                                        {wallet ? 'Deposit STX to start earning POS-GOV tokens' : 'Connect wallet to view your vault'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ==================== GOVERNANCE TAB ==================== */}
                {activeTab === 'governance' && (
                    <div className="fade-in">
                        <div className="section-grid">
                            {/* Create Proposal Card */}
                            <div className="card">
                                <div className="card-title">
                                    <div className="card-title-icon" style={{ background: 'rgba(85,70,255,0.15)' }}>📝</div>
                                    Create Proposal
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        id="input-proposal-title"
                                        type="text"
                                        className="form-input"
                                        placeholder="Proposal title..."
                                        value={proposalForm.title}
                                        onChange={(e) => setProposalForm(f => ({ ...f, title: e.target.value }))}
                                        maxLength={100}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        id="input-proposal-desc"
                                        className="form-input form-textarea"
                                        placeholder="Describe your proposal..."
                                        value={proposalForm.description}
                                        onChange={(e) => setProposalForm(f => ({ ...f, description: e.target.value }))}
                                        maxLength={500}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Type</label>
                                        <select
                                            id="select-proposal-type"
                                            className="form-input form-select"
                                            value={proposalForm.type}
                                            onChange={(e) => setProposalForm(f => ({ ...f, type: e.target.value }))}
                                        >
                                            <option value="general">General</option>
                                            <option value="reward-rate">Reward Rate</option>
                                            <option value="pause">Pause/Unpause</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Value</label>
                                        <input
                                            id="input-proposal-value"
                                            type="number"
                                            className="form-input"
                                            placeholder="0"
                                            value={proposalForm.value}
                                            onChange={(e) => setProposalForm(f => ({ ...f, value: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <button
                                    id="btn-create-proposal"
                                    className="btn btn-primary btn-full"
                                    onClick={handleCreateProposal}
                                    disabled={!proposalForm.title.trim()}
                                >
                                    {wallet ? '🗳️ Submit Proposal' : '⚡ Connect to Propose'}
                                </button>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
                                    Requires minimum 1 POS-GOV token to create a proposal
                                </p>
                            </div>

                            {/* Token Info Card */}
                            <div className="card">
                                <div className="card-title">
                                    <div className="card-title-icon" style={{ background: 'rgba(247,147,26,0.15)' }}>🪙</div>
                                    Governance Token
                                </div>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)' }}>
                                        <div className="stat-label">Your POS-GOV Balance</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-orange-light)' }}>
                                            {formatSTX(tokenBalance)}
                                        </div>
                                    </div>
                                    <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)' }}>
                                        <div className="stat-label">Total Supply</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {formatSTX(totalSupply)}
                                        </div>
                                    </div>
                                    <div style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)' }}>
                                        <div className="stat-label">Your Voting Power</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                                            {totalSupply > 0 ? ((tokenBalance / totalSupply) * 100).toFixed(2) : '0.00'}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Proposals List */}
                        <div className="card" style={{ marginTop: 24 }}>
                            <div className="card-title">
                                <div className="card-title-icon" style={{ background: 'rgba(85,70,255,0.15)' }}>📋</div>
                                Active Proposals
                                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
                                    {proposals.length} total
                                </span>
                            </div>

                            {proposals.length > 0 ? (
                                proposals.map((p) => (
                                    <ProposalItem
                                        key={p.id}
                                        proposal={p}
                                        onVote={handleVote}
                                        onExecute={handleExecute}
                                        wallet={wallet}
                                    />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>🗳️</div>
                                    <p>No proposals yet</p>
                                    <p style={{ fontSize: 13, marginTop: 8 }}>
                                        Be the first to create a governance proposal!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ==================== PORTFOLIO TAB ==================== */}
                {activeTab === 'portfolio' && (
                    <div className="fade-in">
                        <div className="section-grid">
                            <div className="card">
                                <div className="card-title">
                                    <div className="card-title-icon" style={{ background: 'rgba(46,204,113,0.15)' }}>📈</div>
                                    Your Activity
                                </div>
                                {wallet ? (
                                    <div style={{ display: 'grid', gap: 16 }}>
                                        <InfoRow label="Wallet Address" value={wallet.address} mono />
                                        <InfoRow label="Total Deposited" value={`${formatSTX(userStats?.['total-deposited']?.value)} STX`} />
                                        <InfoRow label="Total Withdrawn" value={`${formatSTX(userStats?.['total-withdrawn']?.value)} STX`} />
                                        <InfoRow label="Total Rewards Earned" value={`${formatSTX(userStats?.['total-rewards']?.value)} POS-GOV`} />
                                        <InfoRow label="Deposit Count" value={formatNumber(userStats?.['deposit-count']?.value)} />
                                        <InfoRow label="POS-GOV Balance" value={formatSTX(tokenBalance)} highlight />
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                                        <p>Connect wallet to view portfolio</p>
                                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleConnect}>
                                            ⚡ Connect Wallet
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="card">
                                <div className="card-title">
                                    <div className="card-title-icon" style={{ background: 'rgba(247,147,26,0.15)' }}>🏛️</div>
                                    Protocol Info
                                </div>
                                <div style={{ display: 'grid', gap: 16 }}>
                                    <InfoRow label="Network" value="Stacks Testnet" />
                                    <InfoRow label="Vault Contract" value="vault-core" mono />
                                    <InfoRow label="Token Contract" value="governance-token" mono />
                                    <InfoRow label="Voting Contract" value="proposal-voting" mono />
                                    <InfoRow label="Reward Cycle" value="~144 blocks (~1 day)" />
                                    <InfoRow label="Quorum Required" value="10% of total supply" />
                                    <InfoRow label="Voting Period" value="~1,008 blocks (~7 days)" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>
                    POSVault — Decentralized Treasury & DAO built on{' '}
                    <a href="https://www.stacks.co" target="_blank" rel="noopener noreferrer">Stacks</a>{' '}
                    (Bitcoin L2) | Uses{' '}
                    <a href="https://www.npmjs.com/package/@stacks/connect" target="_blank" rel="noopener noreferrer">@stacks/connect</a>{' '}
                    &{' '}
                    <a href="https://www.npmjs.com/package/@stacks/transactions" target="_blank" rel="noopener noreferrer">@stacks/transactions</a>
                </p>
            </footer>
        </>
    );
}

// ==========================================
// Sub-Components
// ==========================================

function ProposalItem({ proposal, onVote, onExecute, wallet }) {
    const votesFor = parseInt(proposal?.['votes-for']?.value || 0);
    const votesAgainst = parseInt(proposal?.['votes-against']?.value || 0);
    const totalVotes = votesFor + votesAgainst;
    const forPercent = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 50;
    const isExecuted = proposal?.executed?.value === true || proposal?.executed?.value === 'true';
    const isPassed = proposal?.passed?.value === true || proposal?.passed?.value === 'true';

    let status = 'active';
    if (isExecuted) status = isPassed ? 'passed' : 'failed';

    return (
        <div className="proposal-item">
            <div className="proposal-header">
                <div>
                    <div className="proposal-title">
                        #{proposal.id} — {proposal?.title?.value || 'Untitled'}
                    </div>
                </div>
                <span className={`proposal-badge badge-${status}`}>
                    {status}
                </span>
            </div>
            <div className="proposal-description">
                {proposal?.description?.value || 'No description'}
            </div>

            {/* Vote Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span className="text-green">For: {formatSTX(votesFor)}</span>
                <span className="text-red">Against: {formatSTX(votesAgainst)}</span>
            </div>
            <div className="vote-bar">
                <div className="vote-bar-fill" style={{ width: `${forPercent}%` }} />
            </div>

            <div className="proposal-meta">
                <span>Type: {proposal?.['proposal-type']?.value || '—'}</span>
                <span>Voters: {proposal?.['total-voters']?.value || 0}</span>
                <span>End: #{proposal?.['end-block']?.value || '—'}</span>
            </div>

            {/* Actions */}
            {!isExecuted && wallet && (
                <div className="vote-actions">
                    <button className="btn btn-success btn-sm" onClick={() => onVote(proposal.id, true)}>
                        👍 Vote For
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onVote(proposal.id, false)}>
                        👎 Vote Against
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onExecute(proposal.id)} style={{ marginLeft: 'auto' }}>
                        ⚙️ Execute
                    </button>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value, mono, highlight }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-glass)',
        }}>
            <span className="stat-label" style={{ marginBottom: 0, fontSize: 13 }}>{label}</span>
            <span
                className={mono ? 'mono truncate' : 'truncate'}
                style={{
                    maxWidth: 200,
                    fontSize: 14,
                    fontWeight: highlight ? 700 : 500,
                    color: highlight ? 'var(--accent-orange-light)' : 'var(--text-primary)',
                }}
            >
                {value || '—'}
            </span>
        </div>
    );
}
