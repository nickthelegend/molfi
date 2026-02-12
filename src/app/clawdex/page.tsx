"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import {
    Activity,
    Zap,
    Bot,
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    Globe,
    BarChart3,
    Lock,
    ArrowUpRight,
    Search,
    Filter
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLivePrices } from '@/lib/useLivePrices';
import { MOCK_AGENTS, AIAgent, Position, TradingDecision } from '@/lib/agents';

// --- Sub-components ---

const MarketTicker = () => {
    const prices = useLivePrices();
    const tickerItems = Array.from(prices.values());

    return (
        <div className="ticker-container">
            <div className="ticker-content">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                    <span key={i} style={{ margin: '0 2rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        {item.symbol}:
                        <span style={{ color: 'var(--primary-purple)', marginLeft: '0.5rem' }}>
                            ${item.price.toLocaleString()}
                        </span>
                        <span style={{
                            marginLeft: '0.5rem',
                            color: item.change24h >= 0 ? '#10b981' : '#ef4444',
                            fontSize: '0.75rem'
                        }}>
                            {item.change24h >= 0 ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
};

const AgentCard = ({ agent, onStake }: { agent: AIAgent; onStake: (agentId: string) => void }) => {
    return (
        <div className="novel-card">
            <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-md">
                    <div className="novel-avatar-container">
                        <img src={agent.avatar} alt={agent.name} className="novel-avatar" />
                        <div className="trust-badge">
                            <ShieldCheck size={14} />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{agent.name}</h3>
                        <span className="status-badge active">{agent.strategy}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-sm text-dim mb-xs">EST. APY</div>
                    <div className="text-gradient-purple font-bold" style={{ fontSize: '1.5rem' }}>
                        {agent.apy}%
                    </div>
                </div>
            </div>

            <p className="text-secondary text-sm mb-lg" style={{ height: '3rem', overflow: 'hidden' }}>
                {agent.description}
            </p>

            <div className="grid md:grid-cols-3 gap-md mb-lg" style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="text-xs text-dim mb-xs">AUM</div>
                    <div className="font-bold">${(agent.aum / 1000000).toFixed(1)}M</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
                    <div className="text-xs text-dim mb-xs">WIN RATE</div>
                    <div className="font-bold">{agent.winRate}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div className="text-xs text-dim mb-xs">TRADES</div>
                    <div className="font-bold">{agent.totalTrades}</div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Link href={`/clawdex/agent/${agent.id}`} className="text-xs text-primary font-bold hover:underline flex items-center gap-xs">
                    VIEW PROTOCOL <ArrowUpRight size={14} />
                </Link>
                <button className="neon-button" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }} onClick={() => onStake(agent.id)}>
                    STAKE NOW
                </button>
            </div>
        </div>
    );
};

const DecisionLog = () => {
    // Collect all mock decisions across agents
    const allDecisions = MOCK_AGENTS.flatMap(a => a.recentDecisions).sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="novel-card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h3 className="flex items-center gap-sm">
                    <Activity size={20} className="text-primary" />
                    LIVE POSITION LOG
                </h3>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
                {allDecisions.map((dec) => (
                    <div key={dec.id} className="decision-item">
                        <div className="flex items-center justify-between mb-xs">
                            <span className="flex items-center gap-xs text-xs font-bold font-mono">
                                <div className="pulse-dot" />
                                {dec.pair}
                            </span>
                            <span className="text-xs text-dim">
                                {new Date(dec.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-md">
                            <span className={`action-badge ${dec.action.toLowerCase()}`}>
                                {dec.action}
                            </span>
                            <p className="text-xs text-secondary" style={{ flex: 1 }}>{dec.reasoning}</p>
                        </div>
                        <div className="mt-sm flex items-center justify-between">
                            <span className="text-xs font-mono text-dim">PROOF: {dec.proof}</span>
                            <ArrowUpRight size={14} className="text-dim cursor-pointer" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page ---

export default function ClawDexPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <p className="text-secondary">Loading Molfi Agents...</p>
            </div>
        </div>
    );

    return <ClawDexPageContent />;
}

function ClawDexPageContent() {
    const [search, setSearch] = useState('');
    const { isConnected, address } = useAccount();

    const handleStake = (agentId: string) => {
        if (!isConnected) {
            alert("Please connect your wallet to stake.");
            return;
        }
        alert(`Initializing staking protocol for agent: ${agentId}`);
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />



            <div className="container" style={{ paddingTop: '160px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '6rem', textAlign: 'center', position: 'relative' }}>
                    <div className="title-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', opacity: 0.15 }} />

                    <div className="float-anim mb-xl">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '40px', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-glow)' }}>
                            <Bot size={16} className="text-primary" />
                            <span className="text-xs text-gradient-purple font-bold uppercase tracking-widest">Autonomous Intelligence Marketplace</span>
                        </div>
                    </div>

                    <h1 className="hero-title mx-auto" style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1', maxWidth: '900px' }}>
                        The <span className="text-gradient">Financial Brain</span> <br />
                        for the Monad Ecosystem
                    </h1>
                    <p className="hero-subtitle mx-auto" style={{ fontSize: '1.25rem', maxWidth: '800px' }}>
                        Deploy capital into high-performance neural protocols. Verifiable, autonomous, and optimized for the Monad high-throughput parallel execution environment.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center justify-between mb-xl">
                    <div className="flex items-center gap-md" style={{ flex: 1, maxWidth: '500px' }}>
                        <div className="novel-search-container">
                            <Search size={18} className="text-dim" />
                            <input
                                type="text"
                                placeholder="Search agents, strategies, or assets..."
                                className="novel-search-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="glass-icon-button">
                            <Filter size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-xl text-sm font-bold">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-dim uppercase">Active Agents</span>
                            <span className="text-lg">24</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-dim uppercase">Total AUM</span>
                            <span className="text-lg text-gradient-purple">$42.8M</span>
                        </div>
                    </div>
                </div>

                {/* Market Grid */}
                <div className="terminal-grid">
                    {/* Left Panel: Agents */}
                    <div className="col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                            {MOCK_AGENTS
                                .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
                                .map(agent => (
                                    <AgentCard key={agent.id} agent={agent} onStake={handleStake} />
                                ))}
                        </div>
                    </div>

                    {/* Right Panel: Live Decisions & Stats */}
                    <div className="col-span-4 flex flex-col gap-xl">
                        <DecisionLog />

                        <div className="novel-card">
                            <h3 className="mb-md flex items-center gap-sm">
                                <BarChart3 size={20} className="text-primary" />
                                NETWORK STATS
                            </h3>
                            <div className="flex flex-col gap-md">
                                <div className="flex justify-between items-center py-sm border-bottom" style={{ borderColor: 'rgba(168, 85, 247, 0.1)' }}>
                                    <span className="text-sm text-secondary">Total Dividends Paid</span>
                                    <span className="font-bold text-success">$1,240,500</span>
                                </div>
                                <div className="flex justify-between items-center py-sm border-bottom" style={{ borderColor: 'rgba(168, 85, 247, 0.1)' }}>
                                    <span className="text-sm text-secondary">Staked Value</span>
                                    <span className="font-bold">$12.5M</span>
                                </div>
                                <div className="flex justify-between items-center py-sm">
                                    <span className="text-sm text-secondary">Network Accuracy</span>
                                    <span className="font-bold">78.4%</span>
                                </div>
                            </div>
                        </div>

                        <div className="novel-card float-anim" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(10, 10, 15, 0.8) 100%)' }}>
                            <div className="flex items-center gap-md">
                                <Lock size={24} className="text-primary" />
                                <div>
                                    <h4 className="font-bold">Secured by Proof of Trade</h4>
                                    <p className="text-xs text-secondary">All agent decisions are cryptographically signed and stored on-chain.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles Component */}
            <style jsx global>{`
                .novel-avatar-container {
                    position: relative;
                    width: 60px;
                    height: 60px;
                }
                .novel-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 16px;
                    background: var(--bg-accent);
                    padding: 4px;
                    border: 1px solid var(--glass-border);
                }
                .trust-badge {
                    position: absolute;
                    bottom: -4px;
                    right: -4px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid var(--bg-card);
                }
                .novel-search-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 0 1rem;
                    height: 48px;
                    transition: all 0.3s ease;
                }
                .novel-search-container:focus-within {
                    border-color: var(--primary-purple);
                    background: rgba(168, 85, 247, 0.05);
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
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
                    width: 48px;
                    height: 48px;
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
                }
                .decision-item {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(168, 85, 247, 0.05);
                    transition: background 0.3s ease;
                }
                .decision-item:hover {
                    background: rgba(168, 85, 247, 0.03);
                }
                .action-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .action-badge.buy { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981; }
                .action-badge.sell { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }
                .action-badge.hold { background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.3); }

                @media (max-width: 1200px) {
                    .terminal-grid {
                        display: flex;
                        flex-direction: column;
                    }
                    .col-span-8, .col-span-4 {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
