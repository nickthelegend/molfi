"use client";

import { useState } from 'react';
import { Search, Filter, TrendingUp, Shield, Zap } from 'lucide-react';
import AgentCard, { Agent } from '@/components/AgentCard';

// Mock data - will be replaced with real data from contracts
const MOCK_AGENTS: Agent[] = [
    {
        id: '1',
        name: 'AlphaTrader',
        description: 'High-frequency trading agent specializing in ETH/BTC pairs with advanced momentum strategies.',
        owner: '0x1234567890123456789012345678901234567890',
        agentType: 'trader',
        riskProfile: 'aggressive',
        reputationScore: 92,
        tvl: '$1.2M',
        performance30d: '+24.5%',
        targetAssets: ['ETH', 'BTC', 'SOL'],
    },
    {
        id: '2',
        name: 'SafeYield',
        description: 'Conservative fund manager focused on stable yields through diversified DeFi strategies.',
        owner: '0x2345678901234567890123456789012345678901',
        agentType: 'fund-manager',
        riskProfile: 'conservative',
        reputationScore: 88,
        tvl: '$850K',
        performance30d: '+8.2%',
        targetAssets: ['USDC', 'DAI', 'ETH'],
    },
    {
        id: '3',
        name: 'MarketOracle',
        description: 'AI-powered market analyst providing real-time insights and trading signals across multiple chains.',
        owner: '0x3456789012345678901234567890123456789012',
        agentType: 'analyst',
        riskProfile: 'balanced',
        reputationScore: 95,
        tvl: '$2.1M',
        performance30d: '+15.7%',
        targetAssets: ['ETH', 'BTC', 'MATIC', 'ARB'],
    },
];

type FilterType = 'all' | 'fund-manager' | 'trader' | 'analyst';
type SortType = 'newest' | 'reputation' | 'performance' | 'tvl';

export default function AgentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('reputation');
    const [riskFilter, setRiskFilter] = useState<string>('all');

    // Filter and sort agents
    const filteredAgents = MOCK_AGENTS
        .filter((agent) => {
            // Search filter
            const matchesSearch =
                agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agent.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Type filter
            const matchesType = filterType === 'all' || agent.agentType === filterType;

            // Risk filter
            const matchesRisk = riskFilter === 'all' || agent.riskProfile === riskFilter;

            return matchesSearch && matchesType && matchesRisk;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'reputation':
                    return (b.reputationScore || 0) - (a.reputationScore || 0);
                case 'performance':
                    return parseFloat(b.performance30d || '0') - parseFloat(a.performance30d || '0');
                case 'tvl':
                    return parseFloat(b.tvl?.replace(/[$KM]/g, '') || '0') - parseFloat(a.tvl?.replace(/[$KM]/g, '') || '0');
                default:
                    return 0;
            }
        });

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Agent Marketplace</h1>
                <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
                    Discover and invest in autonomous AI agents managing DeFi strategies
                </p>
            </div>

            {/* Stats Bar */}
            <div className="glass-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Total Agents
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                            {MOCK_AGENTS.length}
                        </p>
                    </div>
                    <div>
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Total TVL
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            $4.15M
                        </p>
                    </div>
                    <div>
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            Avg. Performance
                        </p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            +16.1%
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-container" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                {/* Search */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-dim)',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search agents by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>
                </div>

                {/* Filter Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {/* Agent Type Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <Filter size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Agent Type
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {[
                                { value: 'all', label: 'All', icon: null },
                                { value: 'fund-manager', label: 'Fund Managers', icon: TrendingUp },
                                { value: 'trader', label: 'Traders', icon: Zap },
                                { value: 'analyst', label: 'Analysts', icon: Shield },
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setFilterType(value as FilterType)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: filterType === value ? 'var(--primary-purple)' : 'var(--bg-card)',
                                        border: `1px solid ${filterType === value ? 'var(--primary-purple)' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {Icon && <Icon size={14} />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Risk Profile Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Risk Profile
                        </label>
                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                            }}
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="conservative">Conservative</option>
                            <option value="balanced">Balanced</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Sort By
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortType)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                            }}
                        >
                            <option value="reputation">Highest Reputation</option>
                            <option value="performance">Best Performance</option>
                            <option value="tvl">Highest TVL</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    Showing {filteredAgents.length} of {MOCK_AGENTS.length} agents
                </p>
            </div>

            {/* Agent Grid */}
            {filteredAgents.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {filteredAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            ) : (
                <div className="glass-container" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
                        No agents found matching your filters.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setFilterType('all');
                            setRiskFilter('all');
                        }}
                        className="neon-button secondary"
                        style={{ marginTop: '1rem' }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
