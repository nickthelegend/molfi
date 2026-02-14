"use client";

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { User, Bot, TrendingUp, Trophy, Zap, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { shortenAddress } from '@/lib/contract-helpers';
import { formatEther } from 'viem';
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
    const [investmentsLoading, setInvestmentsLoading] = useState(false);

    // Real Data States
    const [myAgents, setMyAgents] = useState<Agent[]>([]);
    const [agentsLoading, setAgentsLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (!isConnected || !address || !publicClient) {
            setInvestments([]);
            setMyAgents([]);
            setActivities([]);
            setAgentsLoading(false);
            return;
        }

        const loadData = async () => {
            setInvestmentsLoading(true);
            setAgentsLoading(true);
            try {
                const res = await fetch('/api/agents');
                const data = await res.json();

                if (!data.success) {
                    setInvestments([]);
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
                                action: d.action === 'BUY' ? 'Position Opened' : 'Trade Executed', // Map to UI terms
                                result: d.action === 'BUY' ? 'Pending' : (d.profit >= 0 ? 'Win' : 'Loss'), // Logic check
                                profit: d.profit ? (d.profit >= 0 ? `+$${d.profit}` : `-$${Math.abs(d.profit)}`) : '--',
                                time: new Date(d.timestamp).toLocaleDateString(),
                                timestamp: d.timestamp
                            });
                        });
                    }
                });
                // Sort by time desc
                setActivities(allActivity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));

                // Process Investments
                const investmentItems = await Promise.all(
                    allAgents.map(async (agent: any) => {
                        if (!agent.vaultAddress) return null;
                        const vaultAddress = agent.vaultAddress as `0x${string}`;

                        try {
                            const shareBalance = await publicClient.readContract({
                                address: vaultAddress,
                                abi: MolfiAgentVaultABI,
                                functionName: "balanceOf",
                                args: [address],
                            }) as bigint;

                            const currentAssets = shareBalance > 0n
                                ? await publicClient.readContract({
                                    address: vaultAddress,
                                    abi: MolfiAgentVaultABI,
                                    functionName: "convertToAssets",
                                    args: [shareBalance],
                                }) as bigint
                                : 0n;

                            const [depositLogs, withdrawLogs] = await Promise.all([
                                publicClient.getLogs({
                                    address: vaultAddress,
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
                                    fromBlock: 'earliest'
                                }),
                                publicClient.getLogs({
                                    address: vaultAddress,
                                    event: {
                                        type: 'event',
                                        name: 'Withdraw',
                                        inputs: [
                                            { type: 'address', indexed: true, name: 'sender' },
                                            { type: 'address', indexed: true, name: 'receiver' },
                                            { type: 'address', indexed: true, name: 'owner' },
                                            { type: 'uint256', indexed: false, name: 'assets' },
                                            { type: 'uint256', indexed: false, name: 'shares' }
                                        ]
                                    },
                                    args: { owner: address },
                                    fromBlock: 'earliest'
                                })
                            ]);

                            const deposits = depositLogs.reduce((sum, log) => sum + (log.args.assets as bigint), 0n);
                            const withdrawals = withdrawLogs.reduce((sum, log) => sum + (log.args.assets as bigint), 0n);
                            const netDeposits = deposits > withdrawals ? deposits - withdrawals : 0n;

                            const deposited = Number(formatEther(netDeposits));
                            const currentValue = Number(formatEther(currentAssets));
                            const pnl = currentValue - deposited;

                            if (deposited <= 0 && currentValue <= 0) return null;

                            return {
                                agentId: Number(agent.agentId),
                                name: agent.name,
                                vaultAddress,
                                deposited,
                                currentValue,
                                pnl,
                                apy: agent.apy,
                            } as InvestmentItem;
                        } catch (err) {
                            console.error("Investment fetch failed:", err);
                            return null;
                        }
                    })
                );

                setInvestments(investmentItems.filter((i): i is InvestmentItem => i !== null));
            } catch (err) {
                console.error("Failed to fetch data", err);
                setInvestments([]);
            } finally {
                setInvestmentsLoading(false);
                setAgentsLoading(false);
            }
        };

        loadData();
    }, [isConnected, address, publicClient]);

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
    // Format TVL for display
    const totalTVLDisplay = totalTVL >= 1000 ? `${(totalTVL / 1000).toFixed(1)}K` : totalTVL.toFixed(0);

    const totalTrades = myAgents.reduce((sum, agent) => sum + agent.totalTrades, 0);
    const avgWinRate = myAgents.length > 0
        ? myAgents.reduce((sum, agent) => sum + agent.winRate, 0) / myAgents.length
        : 0;

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="glass-container" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                {/* Glow effect */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '300px',
                        height: '300px',
                        background: 'var(--primary-purple)',
                        filter: 'blur(100px)',
                        opacity: 0.2,
                        pointerEvents: 'none',
                    }}
                />

                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary-purple), var(--accent-purple))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <User size={40} />
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

            {/* Investments */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={24} style={{ color: 'var(--primary-purple)' }} />
                    My Investments
                </h2>

                {investmentsLoading ? (
                    <div className="glass-container" style={{ padding: '2rem', textAlign: 'center' }}>
                        Loading investments...
                    </div>
                ) : investments.length === 0 ? (
                    <div className="glass-container" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No active investments found yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {investments.map((inv) => (
                            <div key={inv.agentId} className="glass-container" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--primary-purple)' }}>{inv.name}</h3>
                                        <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Agent #{inv.agentId}</p>
                                    </div>
                                    <Link href={`/clawdex/agent/${inv.agentId}`} className="neon-button secondary" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>
                                        View <ExternalLink size={12} style={{ marginLeft: '6px' }} />
                                    </Link>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
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
                            </div>
                        ))}
                    </div>
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
                ) : myAgents.length === 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        <Link
                            href="/setup"
                            className="glass-container"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '300px',
                                textDecoration: 'none',
                                border: '2px dashed var(--glass-border)',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary-purple)';
                                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Plus size={48} style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Deploy New Agent</h3>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', textAlign: 'center' }}>
                                Create and deploy a new AI agent
                            </p>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {myAgents.map((agent) => (
                            <div key={agent.id} className="glass-container" style={{ padding: '1.5rem', position: 'relative' }}>
                                {/* Status Badge */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        padding: '0.25rem 0.75rem',
                                        background: '#10b981', // Default to active for now
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    ACTIVE
                                </div>

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>
                                    {agent.name}
                                </h3>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', textTransform: 'capitalize' }}>
                                    {agent.agentType.replace('-', ' ')}
                                </p>

                                {/* Stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>TVL</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-purple)' }}>
                                            {agent.tvl || '$0'}
                                        </p>
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

                                {/* Actions */}
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

                        {/* Add New Agent Card */}
                        <Link
                            href="/setup"
                            className="glass-container"
                            style={{
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '300px',
                                textDecoration: 'none',
                                border: '2px dashed var(--glass-border)',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary-purple)';
                                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Plus size={48} style={{ color: 'var(--primary-purple)', marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Deploy New Agent</h3>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', textAlign: 'center' }}>
                                Create and deploy a new AI agent
                            </p>
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
                                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No recent activity detected on-chain.
                                        </td>
                                    </tr>
                                ) : (
                                    activities.map((activity) => (
                                        <tr key={activity.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-purple)' }}>{activity.agent}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{activity.action}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: activity.result === 'Win' ? 'rgba(16, 185, 129, 0.2)' : activity.result === 'Loss' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                                        border: `1px solid ${activity.result === 'Win' ? '#10b981' : activity.result === 'Loss' ? '#ef4444' : '#6b7280'}`,
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: activity.result === 'Win' ? '#10b981' : activity.result === 'Loss' ? '#ef4444' : '#6b7280',
                                                    }}
                                                >
                                                    {activity.result}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ color: activity.profit.startsWith('+') ? 'var(--accent-purple)' : activity.profit.startsWith('-') ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600 }}>
                                                    {activity.profit}
                                                </span>
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
