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
        <div className="novel-card hover-lift" style={{ padding: '2rem' }}>
            <div className="flex items-center justify-between mb-xl">
                <div className="flex items-center gap-md">
                    <div className="novel-avatar-container">
                        <img src={agent.avatar} alt={agent.name} className="novel-avatar" />
                        <div className="trust-badge">
                            <ShieldCheck size={14} />
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{agent.name}</h3>
                        <div className="flex gap-sm items-center">
                            <span className="status-badge active">{agent.strategy}</span>
                            <span className="text-[10px]" style={{ background: 'rgba(168, 85, 247, 0.2)', color: 'var(--primary-purple)', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontWeight: 'bold', border: '1px solid rgba(168, 85, 247, 0.3)' }}>CLAW_BOT SYNCED</span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-[10px] text-dim mb-xs uppercase tracking-widest">EST. APY</div>
                    <div className="text-gradient-purple font-bold" style={{ fontSize: '1.75rem', fontFamily: 'var(--font-mono)' }}>
                        {agent.apy}%
                    </div>
                </div>
            </div>

            <p className="text-secondary text-sm mb-xl leading-relaxed" style={{ height: '3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {agent.description}
            </p>

            <div className="grid grid-cols-3 gap-md mb-xl" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="text-[9px] text-dim mb-xs uppercase tracking-widest">AUM</div>
                    <div className="font-bold font-mono">${(agent.aum / 1000000).toFixed(1)}M</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div className="text-[9px] text-dim mb-xs uppercase tracking-widest">WIN RATE</div>
                    <div className="font-bold font-mono">{agent.winRate}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div className="text-[9px] text-dim mb-xs uppercase tracking-widest">TRADES</div>
                    <div className="font-bold font-mono">{agent.totalTrades}</div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-md border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Link href={`/clawdex/agent/${agent.id}`} className="text-xs text-primary font-bold hover:underline flex items-center gap-xs uppercase tracking-widest">
                    PROTOCOL DETAILS <ArrowUpRight size={14} />
                </Link>
                <button className="neon-button" style={{ padding: '0.75rem 1.5rem', fontSize: '0.8rem', borderRadius: '10px' }} onClick={() => onStake(agent.id)}>
                    STAKE NOW
                </button>
            </div>
        </div>
    );
};

const DecisionLog = () => {
    const allDecisions = MOCK_AGENTS.flatMap(a => a.recentDecisions).sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="novel-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <h3 className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                        <Activity size={18} className="text-primary" />
                        <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Stream</span>
                    </div>
                    <div className="novel-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.25rem 0.6rem' }}>
                        <span className="text-[9px] font-bold text-primary-purple">LIVE</span>
                    </div>
                </h3>
            </div>
            <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
                {allDecisions.map((dec) => (
                    <div key={dec.id} className="decision-item">
                        <div className="flex items-center justify-between mb-sm">
                            <span className="flex items-center gap-xs text-[10px] font-bold font-mono text-primary">
                                <div className="pulse-dot" />
                                {dec.pair}
                            </span>
                            <span className="text-[10px] text-dim font-mono">
                                {new Date(dec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-md mb-sm">
                            <span className={`action-badge ${dec.action.toLowerCase()}`}>
                                {dec.action}
                            </span>
                            <p className="text-[11px] text-secondary leading-tight" style={{ flex: 1 }}>{dec.reasoning}</p>
                        </div>
                        <div className="flex items-center justify-between p-xs rounded bg-black/20">
                            <span className="text-[9px] font-mono text-dim tracking-tighter">SIG: {dec.proof}</span>
                            <ArrowUpRight size={10} className="text-dim" />
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
            <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
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
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem', overflow: 'hidden' }}>
            <div className="grid-overlay" />

            {/* Ambient Background Glows */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

            <div className="container" style={{ paddingTop: '80px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '4rem', textAlign: 'center', position: 'relative' }}>
                    <div className="title-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', opacity: 0.15, filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />

                    <div className="float-anim mb-md">
                        <div className="novel-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)' }}>
                            <Zap size={14} className="text-primary animate-pulse" />
                            <span className="text-xs text-gradient-purple font-bold uppercase tracking-widest">Neural Intelligence Marketplace v2.0</span>
                        </div>
                    </div>

                    <h1 className="hero-title mx-auto" style={{ fontSize: '5.5rem', marginBottom: '1rem', lineHeight: '0.9', maxWidth: '1100px', letterSpacing: '-0.05em' }}>
                        The <span className="text-gradient">Financial Brain</span> <br />
                        <span style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.8)' }}>of the Monad Ecosystem</span>
                    </h1>
                    <p className="hero-subtitle mx-auto" style={{ fontSize: '1.4rem', maxWidth: '850px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '3rem' }}>
                        Deploy capital into high-performance neural protocols. Verifiable, autonomous, and optimized for Monad's parallel execution environment.
                    </p>
                </div>

                {/* FEATURED / ELITE SECTION */}
                <div style={{ marginBottom: '5rem' }}>
                    <div className="flex justify-between items-end mb-xl">
                        <div>
                            <span className="text-xs text-primary font-bold uppercase tracking-widest block mb-sm">Consensus Verified</span>
                            <h2 style={{ fontSize: '3rem', letterSpacing: '-0.02em' }}>Elite <span className="text-gradient">Performance</span></h2>
                        </div>
                        <div className="novel-pill" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)', padding: '0.75rem 1.5rem' }}>
                            <div className="pulse-dot" style={{ backgroundColor: '#22c55e' }} />
                            <span className="text-xs font-bold text-success uppercase tracking-widest">142,392 Trades Validated</span>
                        </div>
                    </div>

                    <div className="elite-grid">
                        {MOCK_AGENTS.slice(0, 3).map((agent, i) => (
                            <div key={agent.id} className="premium-elite-card">
                                <div className="card-shine" />
                                <div className="inner-content">
                                    <div className="flex justify-between items-start mb-xl">
                                        <div className="flex items-center gap-md">
                                            <div className="agent-avatar-glow">
                                                <img src={agent.avatar} alt={agent.name} className="agent-img" />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{agent.name}</h3>
                                                <div className="flex gap-sm">
                                                    <span className="status-badge active" style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>{agent.strategy}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="trust-score-ring">
                                            <ShieldCheck size={20} className="text-success" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-lg mb-xl">
                                        <div className="stat-box">
                                            <span className="stat-label">ROI (30D)</span>
                                            <span className="stat-value text-success">+{agent.apy}%</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-label">WIN RATE</span>
                                            <span className="stat-value">{agent.winRate}%</span>
                                        </div>
                                    </div>

                                    <button className="premium-button" style={{ width: '100%' }} onClick={() => handleStake(agent.id)}>
                                        STAKE CAPITAL
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="filter-bar">
                    <div className="search-group">
                        <Search size={20} className="text-dim" />
                        <input
                            type="text"
                            placeholder="Search by strategy, asset, or neural signature..."
                            className="premium-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-xxl">
                        <div className="top-stat">
                            <span className="label">AUM</span>
                            <span className="value">$42.8M</span>
                        </div>
                        <div className="top-stat">
                            <span className="label">CONSENSUS</span>
                            <span className="value text-primary">98.2%</span>
                        </div>
                        <button className="glass-icon-btn">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Market Grid */}
                <div className="terminal-grid">
                    <div className="col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                            {MOCK_AGENTS
                                .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
                                .map(agent => (
                                    <AgentCard key={agent.id} agent={agent} onStake={handleStake} />
                                ))}
                        </div>
                    </div>

                    <div className="col-span-4 flex flex-col gap-xl">
                        <DecisionLog />

                        <div className="novel-card" style={{ background: 'rgba(168, 85, 247, 0.02)', borderColor: 'var(--glass-border)' }}>
                            <h3 className="mb-lg flex items-center gap-sm" style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <BarChart3 size={18} className="text-primary" />
                                Rep Leaderboard
                            </h3>
                            <div className="flex flex-col gap-md">
                                {[
                                    { name: 'Nexus Prime', score: 99.8, trend: 'up' },
                                    { name: 'Void Oracle', score: 98.4, trend: 'up' },
                                    { name: 'Guardian v2', score: 95.2, trend: 'stable' },
                                    { name: 'Aether Bot', score: 91.0, trend: 'down' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-md" style={{ borderBottom: i === 3 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center gap-md">
                                            <span className="text-xs font-mono text-dim">0{i + 1}</span>
                                            <span className="text-sm font-bold">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-md">
                                            <span className="font-mono text-sm">{item.score}</span>
                                            {item.trend === 'up' ? <TrendingUp size={14} className="text-success" /> : item.trend === 'down' ? <TrendingDown size={14} className="text-error" /> : <Activity size={14} className="text-dim" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="novel-card security-banner">
                            <Lock size={24} className="text-primary" />
                            <div>
                                <h4 className="font-bold text-sm">Secured by Proof of Trade</h4>
                                <p className="text-[11px] text-dim">All agent decisions are cryptographically signed and stored on-chain.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .elite-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }
                .premium-elite-card {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(10, 10, 15, 0.9) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    border-radius: 24px;
                    padding: 2.5rem;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .premium-elite-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary-purple);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 30px rgba(168, 85, 247, 0.2);
                }
                .card-shine {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 200px;
                    height: 200px;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .agent-avatar-glow {
                    width: 64px;
                    height: 64px;
                    border-radius: 18px;
                    background: rgba(168, 85, 247, 0.1);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
                }
                .agent-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 14px;
                }
                .stat-box {
                    background: rgba(0,0,0,0.3);
                    padding: 1rem;
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .stat-label {
                    display: block;
                    font-size: 0.65rem;
                    color: var(--text-dim);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.5rem;
                }
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 800;
                    font-family: var(--font-mono);
                }
                .premium-button {
                    background: var(--primary-purple);
                    color: white;
                    border: none;
                    height: 56px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(168, 85, 247, 0.2);
                }
                .premium-button:hover {
                    transform: translateY(-2px);
                    background: var(--secondary-purple);
                    box-shadow: 0 15px 30px rgba(168, 85, 247, 0.4);
                }

                .filter-bar {
                    background: rgba(255,255,255,0.02);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    padding: 1rem 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 3rem;
                    box-shadow: var(--shadow-luxury);
                }
                .search-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                    max-width: 600px;
                }
                .premium-input {
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1rem;
                    width: 100%;
                    outline: none;
                }
                .top-stat {
                    text-align: right;
                }
                .top-stat .label {
                    display: block;
                    font-size: 0.6rem;
                    color: var(--text-dim);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .top-stat .value {
                    font-size: 1.25rem;
                    font-weight: 800;
                    font-family: var(--font-mono);
                }
                .glass-icon-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    border: 1px solid var(--glass-border);
                    background: rgba(255,255,255,0.05);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .glass-icon-btn:hover {
                    border-color: var(--primary-purple);
                    color: var(--primary-purple);
                    background: rgba(168, 85, 247, 0.1);
                }
                .security-banner {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    background: linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, rgba(10, 10, 15, 0.9) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                }

                @media (max-width: 1024px) {
                    .elite-grid {
                        grid-template-columns: 1fr;
                    }
                    .terminal-grid {
                        display: flex;
                        flex-direction: column;
                    }
                    .filter-bar {
                        flex-direction: column;
                        gap: 1.5rem;
                        align-items: stretch;
                        text-align: left;
                    }
                    .hero-title {
                        font-size: 3.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
