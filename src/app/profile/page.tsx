"use client";

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { User, Bot, TrendingUp, Trophy, Zap, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { shortenAddress } from '@/lib/contract-helpers';

// Mock agent data - will be replaced with real data from contracts
const MOCK_AGENTS = [
    {
        id: '1',
        name: 'AlphaTrader',
        type: 'trader',
        status: 'active',
        tvl: '$125K',
        performance30d: '+24.5%',
        winRate: 68,
        totalTrades: 247,
    },
    {
        id: '2',
        name: 'SafeYield',
        type: 'fund-manager',
        status: 'active',
        tvl: '$85K',
        performance30d: '+12.3%',
        winRate: 75,
        totalTrades: 156,
    },
];

const MOCK_ACTIVITY = [
    { id: 1, agent: 'AlphaTrader', action: 'Trade Executed', result: 'Win', profit: '+$1,250', time: '2 hours ago' },
    { id: 2, agent: 'SafeYield', action: 'Position Opened', result: 'Pending', profit: '--', time: '5 hours ago' },
    { id: 3, agent: 'AlphaTrader', action: 'Trade Executed', result: 'Loss', profit: '-$450', time: '1 day ago' },
    { id: 4, agent: 'SafeYield', action: 'Trade Executed', result: 'Win', profit: '+$890', time: '2 days ago' },
];

export default function ProfilePage() {
    const { isConnected, address } = useAccount();

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

    const totalTVL = MOCK_AGENTS.reduce((sum, agent) => sum + parseFloat(agent.tvl.replace(/[$K]/g, '')), 0);
    const totalTrades = MOCK_AGENTS.reduce((sum, agent) => sum + agent.totalTrades, 0);
    const avgWinRate = MOCK_AGENTS.reduce((sum, agent) => sum + agent.winRate, 0) / MOCK_AGENTS.length;

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
                            Managing {MOCK_AGENTS.length} active AI agents
                        </p>
                    </div>

                    <Link href="/setup" className="neon-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Deploy New Agent
                    </Link>
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
                                {MOCK_AGENTS.length}
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
                                ${totalTVL}K
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

            {/* My Agents */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bot size={24} style={{ color: 'var(--primary-purple)' }} />
                    My Agents
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {MOCK_AGENTS.map((agent) => (
                        <div key={agent.id} className="glass-container" style={{ padding: '1.5rem', position: 'relative' }}>
                            {/* Status Badge */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.25rem 0.75rem',
                                    background: agent.status === 'active' ? '#10b981' : '#6b7280',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {agent.status}
                            </div>

                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-purple)' }}>
                                {agent.name}
                            </h3>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', textTransform: 'capitalize' }}>
                                {agent.type.replace('-', ' ')}
                            </p>

                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                <div>
                                    <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>TVL</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-purple)' }}>{agent.tvl}</p>
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
                                <Link href={`/agents/${agent.id}`} className="neon-button" style={{ flex: 1, textAlign: 'center', fontSize: '0.875rem' }}>
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
                                {MOCK_ACTIVITY.map((activity) => (
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
