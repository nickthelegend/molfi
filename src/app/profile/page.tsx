"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { User, Bot, TrendingUp, Trophy, Zap, Plus, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { shortenAddress } from '@/lib/contract-helpers';
import { formatEther, parseEther } from 'viem';
import MolfiAgentVaultABI from '@/abis/MolfiAgentVault.json';

type Agent = {
    id: string;
    agentId: string;
    name: string;
    type: string;
    status: string;
    tvl: string;
    aum: number;
    equity: number;
    performance30d: string;
    winRate: number;
    totalTrades: number;
    owner: string;
    recentDecisions?: any[];
    roi: number;
    agentType: string;
    vaultAddress?: string;
    apy?: number;
};

type InvestmentItem = {
    agentId: number;
    name: string;
    vaultAddress: `0x${string}`;
    deposited: number;
    currentValue: number;
    pnl: number;
    apy?: number;
    txHash: string;
    status: string;
};

type ActivityItem = {
    id: string;
    agent: string;
    action: string;
    result: string;
    profit: string;
    time: string;
    timestamp: number;
};

export default function ProfilePage() {
    const { isConnected, address } = useAccount();
    const publicClient = usePublicClient();
    const [investments, setInvestments] = useState<InvestmentItem[]>([]);
    const [closedInvestments, setClosedInvestments] = useState<InvestmentItem[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
    const [investmentsLoading, setInvestmentsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Real Data States
    const [myAgents, setMyAgents] = useState<Agent[]>([]);
    const [agentsLoading, setAgentsLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    const loadData = useCallback(async (shouldSync = true) => {
        if (!address || !publicClient) return;

        setInvestmentsLoading(true);
        setAgentsLoading(true);
        try {
            const res = await fetch('/api/agents');
            const data = await res.json();

            if (!data.success) {
                setInvestments([]);
                setClosedInvestments([]);
                setMyAgents([]);
                return;
            }

            const allAgents = data.agents || [];

            // Filter My Agents
            const userAgents = allAgents.filter((a: any) =>
                a.owner?.toLowerCase() === address.toLowerCase()
            );
            setMyAgents(userAgents);

            // Aggregate Activity from My Agents
            const allActivity: ActivityItem[] = [];
            userAgents.forEach((agent: any) => {
                if (agent.recentDecisions) {
                    agent.recentDecisions.forEach((d: any) => {
                        allActivity.push({
                            id: d.id || `${agent.id}-${d.timestamp}`,
                            agent: agent.name,
                            action: d.action === 'BUY' ? 'Position Opened' : 'Trade Executed',
                            result: d.action === 'BUY' ? 'Pending' : (d.profit >= 0 ? 'Win' : 'Loss'),
                            profit: d.profit ? (d.profit >= 0 ? `+$${d.profit}` : `-$${Math.abs(d.profit)}`) : '--',
                            time: new Date(d.timestamp).toLocaleDateString(),
                            timestamp: d.timestamp
                        });
                    });
                }
            });
            setActivities(allActivity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));

            // Process Investments from DB
            const investmentsRes = await fetch(`/api/investments/user/${address}`);
            const investmentsData = await investmentsRes.json();
            let initialInvestments = investmentsData.success ? investmentsData.investments : [];

            // Only consider ACTIVE investments for the UI
            const allInvestments = initialInvestments;

            let foundNew = false;

            // BACKGROUND SYNC LOGIC
            if (shouldSync && allAgents.length > 0) {
                setIsSyncing(true);
                const knownHashes = new Set(initialInvestments.map((inv: any) => inv.tx_hash.toLowerCase()));

                // Scan all agents for deposits from this user
                for (const agent of allAgents) {
                    if (!agent.vaultAddress) continue;

                    try {
                        const logs = await publicClient.getLogs({
                            address: agent.vaultAddress as `0x${string}`,
                            event: {
                                type: 'event',
                                name: 'Deposit',
                                inputs: [
                                    { type: 'address', indexed: true, name: 'sender' },
                                    { type: 'address', indexed: true, name: 'owner' },
                                    { type: 'uint256', indexed: false, name: 'assets' },
                                    { type: 'uint256', indexed: false, name: 'shares' }
                                ]
                            },
                            args: { owner: address },
                            fromBlock: 0n
                        });

                        for (const log of logs) {
                            const txHash = log.transactionHash.toLowerCase();
                            if (!knownHashes.has(txHash)) {
                                console.log(`[Sync] Found missing investment: ${txHash}`);
                                const assets = formatEther((log.args as any).assets || 0n);
                                const shares = formatEther((log.args as any).shares || 0n);

                                await fetch('/api/investments/create', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        txHash,
                                        agentId: agent.agentId,
                                        userAddress: address,
                                        amount: assets,
                                        shares: shares !== '0' ? shares : assets
                                    })
                                });
                                foundNew = true;
                            }
                        }
                    } catch (e) {
                        console.error(`Sync failed for agent ${agent.name}:`, e);
                    }
                }

                // NEW: Sync Withdrawals by checking current balance
                // If user has ACTIVE investments in DB but 0 balance on-chain, mark them CLOSED
                // Only iterate through ACTIVE investments for sync check
                const activeForSync = allInvestments.filter((inv: any) => inv.status === 'ACTIVE');

                for (const inv of activeForSync) {
                    if (!inv.agents?.vault_address) continue;

                    try {
                        const balance = await publicClient.readContract({
                            address: inv.agents.vault_address as `0x${string}`,
                            abi: MolfiAgentVaultABI,
                            functionName: 'balanceOf',
                            args: [address]
                        }) as bigint;

                        if (balance === 0n) {
                            console.log(`[Sync] Found closed position for agent ${inv.agents.name}, marking CLOSED`);
                            await fetch('/api/investments/sync-withdrawal', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userAddress: address,
                                    agentId: inv.agent_id,
                                    isFullWithdraw: true
                                })
                            });
                            foundNew = true;
                        }
                    } catch (e: any) {
                        // Check for contract not found or zero data (meaning potentially invalid address)
                        if (e.name === 'ContractFunctionExecutionError' || e.message?.includes('returned no data')) {
                            console.warn(`[Sync] Contract not found or invalid for agent ${inv.agents.name} at ${inv.agents.vault_address}. Skipping.`);
                        } else {
                            console.error(`Withdraw sync failed for investment ${inv.tx_hash}:`, e);
                        }
                    }
                }

                if (foundNew) {
                    const refreshRes = await fetch(`/api/investments/user/${address}`);
                    const refreshData = await refreshRes.json();
                    initialInvestments = refreshData.success ? refreshData.investments : [];
                }
                setIsSyncing(false);
            }

            // Map to UI objects
            const finalInvestments = foundNew
                ? (await (await fetch(`/api/investments/user/${address}`)).json()).investments
                : allInvestments;

            const investmentItems: (InvestmentItem | null)[] = await Promise.all(
                finalInvestments.map(async (inv: any) => {
                    if (!inv.agents?.vault_address) return null;
                    const vaultAddress = inv.agents.vault_address as `0x${string}`;
                    const isClosed = inv.status === 'CLOSED';

                    try {
                        // If closed, we might not have shares anymore, so current value is effectively withdrawn amount or profit
                        // For simplicity in list, if closed, we can show 0 current value or just the static data

                        let currentAssets = 0n;
                        if (!isClosed) {
                            currentAssets = await publicClient.readContract({
                                address: vaultAddress,
                                abi: MolfiAgentVaultABI,
                                functionName: "convertToAssets",
                                args: [parseEther(inv.shares?.toString() || '0')],
                            }) as bigint;
                        }

                        const deposited = parseFloat(inv.amount);
                        const currentValue = isClosed ? 0 : parseFloat(formatEther(currentAssets));
                        const pnl = isClosed ? 0 : currentValue - deposited; // Logic can be improved for closed PnL if we stored it

                        return {
                            agentId: Number(inv.agents.agent_id),
                            name: inv.agents.name,
                            vaultAddress,
                            deposited,
                            currentValue,
                            pnl,
                            apy: 0,
                            txHash: inv.tx_hash,
                            status: inv.status
                        };
                    } catch (err) {
                        return {
                            agentId: Number(inv.agents.agent_id),
                            name: inv.agents.name,
                            vaultAddress,
                            deposited: parseFloat(inv.amount),
                            currentValue: 0,
                            pnl: 0,
                            apy: 0,
                            txHash: inv.tx_hash,
                            status: inv.status
                        };
                    }
                })
            );

            const validItems = investmentItems.filter((i): i is InvestmentItem => i !== null);
            setInvestments(validItems.filter(i => i.status === 'ACTIVE'));
            setClosedInvestments(validItems.filter(i => i.status === 'CLOSED'));
        } catch (err) {
            console.error("Failed to fetch data", err);
            setInvestments([]);
        } finally {
            setInvestmentsLoading(false);
            setAgentsLoading(false);
            setIsSyncing(false);
        }
    }, [address, publicClient]);

    useEffect(() => {
        if (!isConnected || !address || !publicClient) {
            setInvestments([]);
            setClosedInvestments([]);
            setMyAgents([]);
            setActivities([]);
            setAgentsLoading(false);
            return;
        }

        loadData(true);
    }, [isConnected, address, publicClient, loadData]);

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <User size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Connect your wallet to view your profile.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    const totalTVL = myAgents.reduce((sum, agent) => sum + (agent.aum || 0), 0);
    const totalTVLDisplay = totalTVL >= 1000 ? `${(totalTVL / 1000).toFixed(1)}K` : totalTVL.toFixed(0);
    const totalTrades = myAgents.reduce((sum, agent) => sum + agent.totalTrades, 0);
    const avgWinRate = myAgents.length > 0
        ? myAgents.reduce((sum, agent) => sum + agent.winRate, 0) / myAgents.length
        : 0;

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="glass-container" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    background: 'var(--bg-card)',
                                    border: '2px solid var(--primary-purple)',
                                }}
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Agent Manager</h1>
                                <p className="text-mono" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {shortenAddress(address || '')}
                                </p>
                            </div>
                        </div>
                        <p className="text-secondary" style={{ fontSize: '1rem' }}>
                            Managing {myAgents.length} active AI agents
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Link href="/my-agents" className="neon-button secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bot size={18} /> My Agents
                        </Link>
                        <Link href="/setup" className="neon-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={18} /> Deploy New Agent
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-purple)', borderRadius: '12px' }}>
                            <Bot size={24} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Active Agents</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                                {myAgents.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--accent-purple)', borderRadius: '12px' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Total TVL</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                                ${totalTVLDisplay}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary-purple)', borderRadius: '12px' }}>
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Avg Win Rate</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                                {avgWinRate.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--accent-purple)', borderRadius: '12px' }}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Total Trades</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                                {totalTrades}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Investments */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="flex items-center gap-4">
                        <h2 style={{ fontSize: '1.75rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <TrendingUp size={24} style={{ color: 'var(--primary-purple)' }} />
                            My Investments
                            {isSyncing && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-primary-purple animate-pulse">
                                    <RefreshCw size={10} className="animate-spin" /> SYNCING
                                </span>
                            )}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <button
                            onClick={() => setActiveTab('active')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: activeTab === 'active' ? '800' : '500',
                                background: activeTab === 'active' ? 'var(--primary-purple)' : 'transparent',
                                color: activeTab === 'active' ? 'white' : 'var(--text-secondary)',
                                boxShadow: activeTab === 'active' ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab('closed')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: activeTab === 'closed' ? '800' : '500',
                                background: activeTab === 'closed' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: activeTab === 'closed' ? 'white' : 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            History
                        </button>
                    </div>

                    <button
                        onClick={() => loadData(true)}
                        disabled={isSyncing || investmentsLoading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: 'var(--text-dim)',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                            marginLeft: 'auto',
                            textTransform: 'uppercase'
                        }}
                    >
                        <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                        REFRESH
                    </button>
                </div>

                {investmentsLoading ? (
                    <div className="glass-container" style={{ padding: '2rem', textAlign: 'center' }}>
                        <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-primary" />
                        Loading investments...
                    </div>
                ) : (
                    activeTab === 'active' ? (
                        /* ACTIVE INVESTMENTS LIST */
                        (investments.length === 0 && !isSyncing) ? (
                            <div className="glass-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="mb-4">No active investments found.</p>
                                <Link href="/setup" className="neon-button text-xs">Explore Agents</Link>
                            </div>
                        ) : (investments.length === 0 && isSyncing) ? (
                            <div className="glass-container" style={{ padding: '3rem', textAlign: 'center' }}>
                                <p className="font-mono text-xs tracking-widest text-primary animate-pulse">SCANNING_PROTOCOLS...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {investments.map((inv) => (
                                    <div key={inv.txHash} className="glass-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--primary-purple)' }}>{inv.name}</h3>
                                                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Agent #{inv.agentId}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 uppercase">ACTIVE</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <p className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Deposited</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>${inv.deposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Current Value</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>${inv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>PnL</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: inv.pnl >= 0 ? '#10b981' : '#ef4444' }}>
                                                    {inv.pnl >= 0 ? '+' : ''}${inv.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>APY</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                                                    {inv.apy ? `${inv.apy}%` : '--'}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                            <Link href={`/investment/${inv.txHash}`} className="neon-button" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem' }}>
                                                Manage Position
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        /* CLOSED INVESTMENTS LIST */
                        closedInvestments.length === 0 ? (
                            <div className="glass-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <p className="opacity-50 text-sm">No investment history found.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {closedInvestments.map((inv) => (
                                    <div key={inv.txHash} className="glass-container grayscale hover:grayscale-0 transition-all duration-300" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{inv.name}</h3>
                                                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Agent #{inv.agentId}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-gray-400 uppercase">CLOSED</span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <p className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Invested Amount</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dim)' }}>${inv.deposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-secondary" style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Status</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dim)' }}>Settled</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                            <Link href={`/investment/${inv.txHash}`} className="neon-button secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem' }}>
                                                View Receipt <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )
                )}
            </div>

            {/* My Agents */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={24} style={{ color: 'var(--primary-purple)' }} />
                    My Agents
                </h2>

                {agentsLoading ? (
                    <div className="glass-container" style={{ padding: '2rem', textAlign: 'center' }}>
                        Loading your agents...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {myAgents.map((agent) => (
                            <div key={agent.id} className="glass-container" style={{ padding: '1.5rem', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.75rem', background: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                    ACTIVE
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>{agent.name}</h3>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', textTransform: 'capitalize' }}>{agent.agentType.replace('-', ' ')}</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>TVL</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-purple)' }}>{agent.tvl || '$0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>30d Performance</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{agent.performance30d}</p>
                                    </div>
                                    <div>
                                        <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Win Rate</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{agent.winRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Trades</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{agent.totalTrades}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Link href={`/clawdex/agent/${agent.agentId}`} className="neon-button" style={{ flex: 1, textAlign: 'center', fontSize: '0.875rem' }}>
                                        View Details
                                    </Link>
                                    <button className="neon-button secondary" style={{ padding: '0.5rem 1rem' }}>
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <Link
                            href="/setup"
                            className="glass-container"
                            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textDecoration: 'none', border: '2px dashed var(--glass-border)', transition: 'all 0.3s' }}
                        >
                            <Plus size={48} style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Deploy New Agent</h3>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', textAlign: 'center' }}>Create and deploy a new AI agent</p>
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={24} style={{ color: 'var(--primary-purple)' }} />
                    Recent Activity
                </h2>

                <div className="glass-container" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Agent</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Result</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Profit/Loss</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent activity detected on-chain.</td>
                                    </tr>
                                ) : (
                                    activities.map((activity) => (
                                        <tr key={activity.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-purple)' }}>{activity.agent}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{activity.action}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ padding: '0.25rem 0.75rem', background: activity.result === 'Win' ? 'rgba(16, 185, 129, 0.2)' : activity.result === 'Loss' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)', border: `1px solid ${activity.result === 'Win' ? '#10b981' : activity.result === 'Loss' ? '#ef4444' : '#6b7280'}`, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, color: activity.result === 'Win' ? '#10b981' : activity.result === 'Loss' ? '#ef4444' : '#6b7280' }}>
                                                    {activity.result}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ color: activity.profit.startsWith('+') ? 'var(--accent-purple)' : activity.profit.startsWith('-') ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600 }}>{activity.profit}</span>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{activity.time}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
