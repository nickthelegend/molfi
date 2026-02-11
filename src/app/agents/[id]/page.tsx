"use client";

import { use } from 'react';
import { TrendingUp, Shield, Zap, ExternalLink, Star, MessageSquare, Activity } from 'lucide-react';
import Link from 'next/link';
import { shortenAddress, getExplorerUrl } from '@/lib/contract-helpers';

// Mock agent data - will be replaced with real data from contracts
const MOCK_AGENT = {
    id: '1',
    name: 'AlphaTrader',
    description: 'High-frequency trading agent specializing in ETH/BTC pairs with advanced momentum strategies. Uses machine learning to identify optimal entry and exit points.',
    owner: '0x1234567890123456789012345678901234567890',
    agentWallet: '0x2345678901234567890123456789012345678901',
    agentType: 'trader',
    riskProfile: 'aggressive',
    reputationScore: 92,
    tvl: '$1.2M',
    performance30d: '+24.5%',
    performance7d: '+12.3%',
    performance24h: '+3.8%',
    targetAssets: ['ETH', 'BTC', 'SOL', 'MATIC'],
    leverage: 10,
    tradingStyle: 'Scalping',
    totalTrades: 1247,
    winRate: 68.5,
    apiEndpoint: 'https://api.alphatrader.io',
    twitter: '@alphatrader',
    discord: 'alphatrader#1234',
};

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const agent = MOCK_AGENT; // In real app, fetch by ID

    const getTypeIcon = () => {
        switch (agent.agentType) {
            case 'fund-manager':
                return <TrendingUp size={24} />;
            case 'trader':
                return <Zap size={24} />;
            case 'analyst':
                return <Shield size={24} />;
        }
    };

    const getRiskColor = () => {
        switch (agent.riskProfile) {
            case 'conservative':
                return '#10b981';
            case 'balanced':
                return '#a855f7';
            case 'aggressive':
                return '#ef4444';
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Link */}
            <Link href="/agents" style={{ color: 'var(--primary-purple)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>
                ← Back to Marketplace
            </Link>

            {/* Header */}
            <div className="glass-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ color: 'var(--primary-purple)' }}>
                                {getTypeIcon()}
                            </div>
                            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{agent.name}</h1>
                            <span
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: 'var(--primary-purple)',
                                    borderRadius: '20px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {agent.reputationScore}/100
                            </span>
                        </div>

                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                            {agent.description}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: getRiskColor() + '20',
                                    border: `1px solid ${getRiskColor()}`,
                                    borderRadius: '12px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: getRiskColor(),
                                    textTransform: 'capitalize',
                                }}
                            >
                                {agent.riskProfile}
                            </span>
                            <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                Owner: <span className="text-mono">{shortenAddress(agent.owner)}</span>
                            </span>
                            <a
                                href={getExplorerUrl(41454, agent.owner)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--primary-purple)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                View on Explorer <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    <button className="neon-button" style={{ minWidth: '150px' }}>
                        Invest in Agent
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Value Locked</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>{agent.tvl}</p>
                </div>
                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>30d Performance</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{agent.performance30d}</p>
                </div>
                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Win Rate</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{agent.winRate}%</p>
                </div>
                <div className="glass-container" style={{ padding: '1.5rem' }}>
                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Trades</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>{agent.totalTrades.toLocaleString()}</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Left Column */}
                <div>
                    {/* Performance Chart Placeholder */}
                    <div className="glass-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} style={{ color: 'var(--primary-purple)' }} />
                            Performance
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>24h</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{agent.performance24h}</p>
                            </div>
                            <div>
                                <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>7d</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{agent.performance7d}</p>
                            </div>
                            <div>
                                <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>30d</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-purple)' }}>{agent.performance30d}</p>
                            </div>
                        </div>
                        <div style={{ height: '200px', background: 'var(--bg-card)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-secondary">Performance Chart (Coming Soon)</p>
                        </div>
                    </div>

                    {/* Strategy Details */}
                    <div className="glass-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Strategy Details</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Trading Style</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{agent.tradingStyle}</p>
                            </div>
                            <div>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Leverage</p>
                                <p style={{ fontSize: '1rem', fontWeight: 600 }}>{agent.leverage}x</p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Target Assets</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {agent.targetAssets.map((asset) => (
                                        <span
                                            key={asset}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'var(--primary-purple)',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {asset}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="glass-container" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={20} style={{ color: 'var(--primary-purple)' }} />
                            Community Feedback
                        </h2>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p className="text-secondary">No feedback yet. Be the first to review this agent!</p>
                            <button className="neon-button secondary" style={{ marginTop: '1rem' }}>
                                Leave Feedback
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Agent Info */}
                    <div className="glass-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Agent Information</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Agent Wallet</p>
                            <p className="text-mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{agent.agentWallet}</p>
                        </div>

                        {agent.apiEndpoint && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>API Endpoint</p>
                                <a href={agent.apiEndpoint} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-purple)', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {agent.apiEndpoint} <ExternalLink size={12} />
                                </a>
                            </div>
                        )}

                        {agent.twitter && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Twitter</p>
                                <a href={`https://twitter.com/${agent.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-purple)', fontSize: '0.875rem', textDecoration: 'none' }}>
                                    {agent.twitter}
                                </a>
                            </div>
                        )}

                        {agent.discord && (
                            <div>
                                <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Discord</p>
                                <p style={{ fontSize: '0.875rem' }}>{agent.discord}</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-container" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button className="neon-button" style={{ width: '100%' }}>
                                Invest Now
                            </button>
                            <button className="neon-button secondary" style={{ width: '100%' }}>
                                <Star size={16} style={{ marginRight: '0.5rem' }} />
                                Add to Watchlist
                            </button>
                            <button className="neon-button secondary" style={{ width: '100%' }}>
                                <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
                                Leave Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
