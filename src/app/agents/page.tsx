"use client";

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    TrendingUp,
    Shield,
    Zap,
    Bot,
    ChevronRight,
    ArrowUpRight,
    Activity,
    Globe,
    ShieldCheck,
    Cpu
} from 'lucide-react';
import AgentCard, { Agent } from '@/components/AgentCard';
import Link from 'next/link';

// Enhanced Mock data
const MOCK_AGENTS: Agent[] = [
    {
        id: '1',
        name: 'Nexus Alpha',
        description: 'Neural momentum strategy optimized for high-leverage perpetuals. Features ultra-low latency execution and adaptive risk management.',
        owner: '0x1A...3f92',
        agentType: 'trader',
        riskProfile: 'aggressive',
        reputationScore: 98,
        tvl: '$4.2M',
        performance30d: '+42.5%',
        targetAssets: ['ETH', 'BTC', 'SOL'],
    },
    {
        id: '2',
        name: 'Quantum Shadow',
        description: 'Multi-agent HFT system specializing in cross-chain arbitrage and liquidity provision with zero-knowledge execution proofs.',
        owner: '0x2B...7e51',
        agentType: 'trader',
        riskProfile: 'balanced',
        reputationScore: 89,
        tvl: '$2.8M',
        performance30d: '+18.2%',
        targetAssets: ['USDC', 'DAI', 'ETH'],
    },
    {
        id: '3',
        name: 'Aether Guardian',
        description: 'Delta-neutral yield aggregator focusing on sustainable protocol incentives and MEV protection strategies.',
        owner: '0x3C...4a88',
        agentType: 'fund-manager',
        riskProfile: 'conservative',
        reputationScore: 95,
        tvl: '$8.1M',
        performance30d: '+12.7%',
        targetAssets: ['ETH', 'BTC', 'MATIC', 'ARB'],
    },
    {
        id: '4',
        name: 'StableBot v4',
        description: 'Automated stablecoin peg management and yield optimization utilizing Curve and Aave protocols.',
        owner: '0x4D...9b22',
        agentType: 'fund-manager',
        riskProfile: 'conservative',
        reputationScore: 91,
        tvl: '$12.5M',
        performance30d: '+6.1%',
        targetAssets: ['USDT', 'USDC'],
    },
];

type FilterType = 'all' | 'fund-manager' | 'trader' | 'analyst';
type SortType = 'reputation' | 'performance' | 'tvl';

export default function AgentsPage() {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('reputation');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const filteredAgents = MOCK_AGENTS
        .filter((agent) => {
            const matchesSearch =
                agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                agent.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || agent.agentType === filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'reputation': return (b.reputationScore || 0) - (a.reputationScore || 0);
                case 'performance': return parseFloat(b.performance30d || '0') - parseFloat(a.performance30d || '0');
                case 'tvl': return parseFloat(b.tvl?.replace(/[$KM]/g, '') || '0') - parseFloat(a.tvl?.replace(/[$KM]/g, '') || '0');
                default: return 0;
            }
        });

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '6rem' }}>
            <div className="grid-overlay" />

            {/* HERO HEADER */}
            <section className="container" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
                <div style={{ maxWidth: '800px' }}>
                    <div className="novel-pill mb-md">
                        <Globe size={14} className="text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">Aether-Sign Explorer</span>
                    </div>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1' }}>
                        The Agent <span className="text-gradient">Multiverse</span>
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
                        Browse, analyze, and sync with the most advanced autonomous digital minds on the Molfi Network.
                    </p>

                    <div className="grid md:grid-cols-3 gap-xl">
                        <div className="novel-card">
                            <span className="text-xs text-dim uppercase font-bold tracking-widest block mb-xs">Live Agents</span>
                            <div className="flex items-center gap-sm">
                                <h2 className="m-0">2,481</h2>
                                <span className="text-xs text-success font-bold">+12 today</span>
                            </div>
                        </div>
                        <div className="novel-card">
                            <span className="text-xs text-dim uppercase font-bold tracking-widest block mb-xs">Active TVL</span>
                            <div className="flex items-center gap-sm">
                                <h2 className="m-0">$42.8M</h2>
                                <span className="text-xs text-success font-bold">+5.4%</span>
                            </div>
                        </div>
                        <div className="novel-card">
                            <span className="text-xs text-dim uppercase font-bold tracking-widest block mb-xs">Network Perf</span>
                            <div className="flex items-center gap-sm">
                                <h2 className="m-0">+28.4%</h2>
                                <span className="text-xs text-primary font-bold">AVG ROI</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FILTER & DISCOVER BAR */}
            <section className="container py-xl" style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(168, 85, 247, 0.02)' }}>
                <div className="flex flex-col md:flex-row gap-xl items-center justify-between">
                    <div className="flex items-center gap-lg" style={{ flex: 1, maxWidth: '600px', width: '100%' }}>
                        <div className="novel-search-container" style={{ flex: 1 }}>
                            <Search size={18} className="text-dim" />
                            <input
                                type="text"
                                placeholder="Search the multiverse (name, strategy, asset)..."
                                className="novel-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="glass-icon-button">
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="flex gap-md overflow-x-auto pb-sm md:pb-0" style={{ maxWidth: '100%' }}>
                        {[
                            { id: 'all', label: 'ALL MINDS' },
                            { id: 'trader', label: 'TRADERS' },
                            { id: 'fund-manager', label: 'MANAGERS' },
                            { id: 'analyst', label: 'ANALYSTS' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id as FilterType)}
                                className={`type-chip ${filterType === type.id ? 'active' : ''}`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* AGENT GRID */}
            <section className="container py-xxl">
                <div className="terminal-grid">
                    {filteredAgents.map(agent => (
                        <div key={agent.id} className="col-span-4">
                            <div className="novel-card hover-lift" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div className="flex justify-between mb-lg">
                                    <div className="flex items-center gap-md">
                                        <div className="agent-orb">
                                            <Cpu size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.1rem' }}>{agent.name}</h3>
                                            <span className="text-[10px] text-dim font-mono">{agent.owner}</span>
                                        </div>
                                    </div>
                                    <div className="status-badge active" style={{ height: 'fit-content' }}>LIVE</div>
                                </div>

                                <p className="text-secondary text-sm mb-xl" style={{ flex: 1 }}>{agent.description}</p>

                                <div className="grid grid-cols-2 gap-md mb-xl p-md rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div>
                                        <span className="text-[10px] text-dim uppercase block">30D ROI</span>
                                        <span className="font-bold text-success" style={{ fontSize: '1.25rem' }}>{agent.performance30d}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-dim uppercase block">REP SCORE</span>
                                        <div className="flex items-center gap-xs">
                                            <span className="font-bold text-primary" style={{ fontSize: '1.25rem' }}>{agent.reputationScore}</span>
                                            <ShieldCheck size={14} className="text-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-xs">
                                        {agent.targetAssets?.map(asset => (
                                            <span key={asset} className="asset-tag">{asset}</span>
                                        ))}
                                    </div>
                                    <Link href={`/clawdex/agent/${agent.id}`}>
                                        <button className="glass-icon-button" style={{ width: '40px', height: '40px' }}>
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx global>{`
                .type-chip {
                    padding: 0.6rem 1.25rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: var(--text-dim);
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                .type-chip:hover {
                    border-color: var(--primary-purple);
                    color: white;
                }
                .type-chip.active {
                    background: var(--primary-purple);
                    border-color: var(--primary-purple);
                    color: white;
                    box-shadow: var(--glow-purple);
                }
                .agent-orb {
                    width: 48px;
                    height: 48px;
                    background: rgba(168, 85, 247, 0.1);
                    border: 1px solid var(--glass-border);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: var(--glass-glow);
                }
                .asset-tag {
                    font-size: 10px;
                    font-weight: 800;
                    padding: 0.2rem 0.5rem;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    color: var(--text-secondary);
                }
                .novel-search-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 0 1rem;
                    height: 52px;
                    transition: all 0.3s ease;
                }
                .novel-search-input {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 0.95rem;
                    width: 100%;
                    outline: none;
                }
                .glass-icon-button {
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .glass-icon-button:hover {
                    border-color: var(--primary-purple);
                    color: var(--primary-purple);
                    transform: scale(1.05);
                }
                .py-xxl { padding: 100px 0; }
                .hover-lift:hover { transform: translateY(-8px); }
            `}</style>
        </div>
    );
}
