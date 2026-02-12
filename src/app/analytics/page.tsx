"use client";

import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

    // Mock data - replace with real API calls
    const stats = {
        totalVolume: {
            '24h': 2500000,
            '7d': 15000000,
            '30d': 58000000,
        },
        totalTrades: {
            '24h': 1250,
            '7d': 8500,
            '30d': 32000,
        },
        activeAgents: {
            '24h': 45,
            '7d': 120,
            '30d': 380,
        },
        feeRevenue: {
            '24h': 2500,
            '7d': 15000,
            '30d': 58000,
        },
    };

    const topPerformers = [
        { id: '1', name: 'AlphaTrader', pnl: 125000, trades: 450, winRate: 68 },
        { id: '2', name: 'SafeYield', pnl: 98000, trades: 320, winRate: 75 },
        { id: '3', name: 'MomentumBot', pnl: 87000, trades: 580, winRate: 62 },
        { id: '4', name: 'GridMaster', pnl: 76000, trades: 890, winRate: 58 },
        { id: '5', name: 'ArbitrageKing', pnl: 65000, trades: 1200, winRate: 55 },
    ];

    const volumeByPair = [
        { pair: 'BTC/USDT', volume: 1800000, percentage: 72 },
        { pair: 'ETH/USDT', volume: 700000, percentage: 28 },
    ];

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
        return `$${num.toFixed(0)}`;
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={32} style={{ color: 'var(--primary-purple)' }} />
                    Platform Analytics
                </h1>
                <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
                    Comprehensive platform statistics and performance metrics
                </p>
            </div>

            {/* Time Range Selector */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => setTimeRange('24h')}
                    className={timeRange === '24h' ? 'neon-button' : 'neon-button secondary'}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    24 Hours
                </button>
                <button
                    onClick={() => setTimeRange('7d')}
                    className={timeRange === '7d' ? 'neon-button' : 'neon-button secondary'}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    7 Days
                </button>
                <button
                    onClick={() => setTimeRange('30d')}
                    className={timeRange === '30d' ? 'neon-button' : 'neon-button secondary'}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    30 Days
                </button>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-container" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px' }}>
                            <DollarSign size={24} style={{ color: 'var(--primary-purple)' }} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Volume</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                                {formatNumber(stats.totalVolume[timeRange])}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>+12.5%</span>
                        <span className="text-secondary">vs previous period</span>
                    </div>
                </div>

                <div className="glass-container" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px' }}>
                            <Zap size={24} style={{ color: 'var(--accent-purple)' }} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Trades</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                                {stats.totalTrades[timeRange].toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>+8.3%</span>
                        <span className="text-secondary">vs previous period</span>
                    </div>
                </div>

                <div className="glass-container" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px' }}>
                            <Users size={24} style={{ color: 'var(--primary-purple)' }} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Active Agents</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                                {stats.activeAgents[timeRange]}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>+15.2%</span>
                        <span className="text-secondary">vs previous period</span>
                    </div>
                </div>

                <div className="glass-container" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px' }}>
                            <DollarSign size={24} style={{ color: '#10b981' }} />
                        </div>
                        <div>
                            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Fee Revenue</p>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                                {formatNumber(stats.feeRevenue[timeRange])}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontWeight: 600 }}>+10.8%</span>
                        <span className="text-secondary">vs previous period</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Top Performers */}
                <div className="glass-container" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Top Performing Agents</h3>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        {topPerformers.map((agent, index) => (
                            <Link
                                key={agent.id}
                                href={`/analytics/agent/${agent.id}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    marginBottom: index < topPerformers.length - 1 ? '0.75rem' : '0',
                                    background: 'rgba(168, 85, 247, 0.05)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                                className="hover-lift"
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-purple)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                }}>
                                    #{index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{agent.name}</p>
                                    <p className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                        {agent.trades} trades • {agent.winRate}% win rate
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 700, color: '#10b981', fontSize: '1.125rem' }}>
                                        +{formatNumber(agent.pnl)}
                                    </p>
                                    <p className="text-secondary" style={{ fontSize: '0.75rem' }}>PnL</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Volume by Pair */}
                <div className="glass-container" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Volume by Trading Pair</h3>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        {volumeByPair.map((item, index) => (
                            <div key={item.pair} style={{ marginBottom: index < volumeByPair.length - 1 ? '2rem' : '0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>{item.pair}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary-purple)', fontSize: '1.125rem' }}>
                                        {formatNumber(item.volume)}
                                    </span>
                                </div>
                                <div style={{
                                    height: '8px',
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${item.percentage}%`,
                                        background: 'linear-gradient(90deg, var(--primary-purple), var(--accent-purple))',
                                        borderRadius: '4px',
                                    }} />
                                </div>
                                <p className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                    {item.percentage}% of total volume
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
