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



            <div className="container" style={{ paddingTop: '100px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '4rem', textAlign: 'center', position: 'relative' }}>
                    <div className="title-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', opacity: 0.2, filter: 'blur(100px)' }} />

                    <div className="float-anim mb-xl">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '40px', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-glow)', backdropFilter: 'blur(10px)' }}>
                            <Zap size={16} className="text-primary animate-pulse" />
                            <span className="text-xs text-gradient-purple font-bold uppercase tracking-widest">Neural Intelligence Marketplace v2.0</span>
                        </div>
                    </div>

                    <h1 className="hero-title mx-auto" style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: '0.9', maxWidth: '1000px', letterSpacing: '-0.04em' }}>
                        The <span className="text-gradient">Financial Brain</span> <br />
                        <span style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.7)' }}>of the Monad Ecosystem</span>
                    </h1>
                    <p className="hero-subtitle mx-auto" style={{ fontSize: '1.4rem', maxWidth: '850px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        Deploy capital into high-performance neural protocols. Verifiable, autonomous, and optimized for Monad's parallel execution environment.
                    </p>
                </div>

                {/* ELITE AGENTS (NEW SECTION) */}
                <div style={{ marginBottom: '6rem' }}>
                    <div className="flex justify-between items-center mb-xl">
                        <div>
                            <span className="text-xs text-primary font-bold uppercase tracking-widest block mb-xs">Featured Protocols</span>
                            <h2 style={{ fontSize: '2.5rem' }}>Elite <span className="text-gradient">Performance</span></h2>
                        </div>
                        <div className="flex gap-md">
                            <div className="novel-pill" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                                <div className="pulse-dot" style={{ backgroundColor: '#22c55e' }} />
                                <span className="text-[10px] font-bold text-success uppercase">142,392 Trades Validated</span>
                            </div>
                        </div>
                    </div>

                    <div className="elite-slider">
                        {MOCK_AGENTS.slice(0, 3).map(agent => (
                            <div key={agent.id} className="elite-card novel-card">
                                <div className="elite-card-bg" style={{ backgroundImage: `url(${agent.avatar})` }} />
                                <div className="elite-card-content">
                                    <div className="flex justify-between items-start mb-lg">
                                        <div className="agent-badge active">{agent.strategy}</div>
                                        <div className="trust-badge-large"><ShieldCheck size={18} /></div>
                                    </div>
                                    <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{agent.name}</h3>
                                    <div className="flex gap-xl mb-xl">
                                        <div>
                                            <span className="text-xs text-dim block uppercase">ROI (30D)</span>
                                            <span className="text-xl font-bold text-success">+{agent.apy}%</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-dim block uppercase">Success Rate</span>
                                            <span className="text-xl font-bold">{agent.winRate}%</span>
                                        </div>
                                    </div>
                                    <button className="neon-button hero-cta" style={{ width: '100%' }} onClick={() => handleStake(agent.id)}>STAKE CAPITAL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex items-center justify-between mb-xl p-lg novel-card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-md" style={{ flex: 1, maxWidth: '600px' }}>
                        <div className="novel-search-container" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Search size={18} className="text-dim" />
                            <input
                                type="text"
                                placeholder="Filter by strategy, asset, or neural signature..."
                                className="novel-search-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="glass-icon-button">
                            <Filter size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-xxl">
                        <div className="stat-item">
                            <span className="text-[10px] text-dim uppercase tracking-tighter">Total Liquidity</span>
                            <span className="text-xl font-mono tracking-tighter">$42,850,200</span>
                        </div>
                        <div className="stat-item">
                            <span className="text-[10px] text-dim uppercase tracking-tighter">Agent Consensus</span>
                            <span className="text-xl font-mono tracking-tighter text-primary">98.2%</span>
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

                        <div className="novel-card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)', boxShadow: 'var(--glass-glow)' }}>
                            <h3 className="mb-md flex items-center gap-sm">
                                <BarChart3 size={20} className="text-primary" />
                                REPUTATION LEADERBOARD
                            </h3>
                            <div className="flex flex-col gap-md">
                                {[
                                    { name: 'Nexus Prime', score: 99.8, trend: 'up' },
                                    { name: 'Void Oracle', score: 98.4, trend: 'up' },
                                    { name: 'Guardian v2', score: 95.2, trend: 'stable' },
                                    { name: 'Aether Bot', score: 91.0, trend: 'down' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-sm border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center gap-md">
                                            <span className="text-xs text-dim">#{i + 1}</span>
                                            <span className="text-sm font-bold">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-sm">
                                            <span className="font-mono text-sm">{item.score}</span>
                                            {item.trend === 'up' ? <TrendingUp size={12} className="text-success" /> : item.trend === 'down' ? <TrendingDown size={12} className="text-error" /> : <Activity size={12} className="text-dim" />}
                                        </div>
                                    </div>
                                ))}
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

                .elite-slider {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }
                .elite-card {
                    position: relative;
                    height: 380px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .elite-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary-purple);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(168, 85, 247, 0.2);
                }
                .elite-card-bg {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    filter: saturate(0.5) brightness(0.4);
                    transition: all 0.5s ease;
                    z-index: 0;
                }
                .elite-card:hover .elite-card-bg {
                    filter: saturate(1) brightness(0.6);
                    transform: scale(1.1);
                }
                .elite-card-content {
                    position: relative;
                    z-index: 1;
                    padding: 2.5rem;
                    background: linear-gradient(to top, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.6) 50%, transparent 100%);
                }
                .trust-badge-large {
                    background: #10b981;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                @media (max-width: 1200px) {
                    .elite-slider {
                        grid-template-columns: 1fr;
                    }
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
