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
        <div className="ticker-container" style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.2)', background: 'rgba(10, 10, 15, 0.8)' }}>
            <div className="ticker-content">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                    <span key={i} className="ticker-item">
                        <span className="ticker-symbol">{item.symbol}</span>
                        <span className="ticker-price">${item.price.toLocaleString()}</span>
                        <span className={`ticker-change ${item.change24h >= 0 ? 'up' : 'down'}`}>
                            {item.change24h >= 0 ? '▲' : '▼'} {Math.abs(item.change24h).toFixed(2)}%
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
};

const AgentCard = ({ agent, onStake }: { agent: any; onStake: (agentId: string) => void }) => {
    const isMock = typeof agent.id === 'string' && agent.id.startsWith('agent-');

    return (
        <div className="premium-card group">
            <div className="card-top">
                <div className="flex items-center gap-lg">
                    <div className="agent-orb">
                        <img src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`} alt={agent.name} />
                        <div className="orb-ring" />
                    </div>
                    <div>
                        <h3 className="agent-title">{agent.name}</h3>
                        <div className="flex gap-sm items-center">
                            <span className="strategy-tag">{agent.strategy || agent.personality || 'Neural Core'}</span>
                            <div className="sync-badge">
                                <Activity size={10} className="animate-pulse" />
                                <span>CLAW_SYNCED</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="apy-display">
                    <span className="apy-label">EST. APY</span>
                    <span className="apy-value">{agent.apy || '24.8'}%</span>
                </div>
            </div>

            <p className="description-text">
                {agent.description || `Autonomous neural entity specialized in ${agent.personality || 'Balanced'} market strategies. Optimizing for long-term alpha on Monad.`}
            </p>

            <div className="stat-grid">
                <div className="stat-item">
                    <span className="stat-sm-label">AUM</span>
                    <span className="stat-sm-value">${agent.aum ? (agent.aum / 1000000).toFixed(1) : '1.2'}M</span>
                </div>
                <div className="stat-item border-x">
                    <span className="stat-sm-label">WIN RATE</span>
                    <span className="stat-sm-value">{agent.winRate || '68'}%</span>
                </div>
                <div className="stat-item">
                    <span className="stat-sm-label">RELAYED</span>
                    <span className="stat-sm-value">{agent.totalTrades || '154'}</span>
                </div>
            </div>

            <div className="card-footer">
                <Link href={`/clawdex/agent/${agent.agentId || agent.id}`} className="details-link">
                    NEURAL PROFILE <ArrowUpRight size={14} />
                </Link>
                <button className="stake-button" onClick={() => onStake(agent.agentId || agent.id)}>
                    ALLOCATE
                </button>
            </div>
        </div>
    );
};

const DecisionLog = () => {
    const [signals, setSignals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const res = await fetch('/api/signals');
                const data = await res.json();
                if (data.success) {
                    setSignals(data.signals);
                }
            } catch (err) {
                console.error("Failed to fetch signals:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSignals();
        const interval = setInterval(fetchSignals, 5000);
        return () => clearInterval(interval);
    }, []);

    const displaySignals = signals.length > 0 ? signals : MOCK_AGENTS[0].recentDecisions;

    return (
        <div className="neural-stream-container">
            <div className="stream-header">
                <div className="flex items-center gap-sm">
                    <div className="neural-icon">
                        <Zap size={16} />
                    </div>
                    <span className="header-text">Neural Transmission Stream</span>
                </div>
                <div className="live-status">
                    <div className="pulse-dot" />
                    <span>LATEST SIGS</span>
                </div>
            </div>

            <div className="stream-content custom-scrollbar">
                {loading && signals.length === 0 ? (
                    <div className="p-xl text-center text-dim text-xs animate-pulse">Syncing with ClawBot Network...</div>
                ) : (
                    displaySignals.map((sig, i) => (
                        <div key={sig.id || i} className="stream-item fade-in">
                            <div className="item-top">
                                <span className={`side-label ${sig.isLong || sig.action === 'BUY' ? 'long' : 'short'}`}>
                                    {sig.isLong || sig.action === 'BUY' ? 'BUY / LONG' : sig.action === 'HOLD' ? 'STAY / HOLD' : 'SELL / SHORT'}
                                </span>
                                <span className="item-time">
                                    {sig.createdAt ? new Date(sig.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="item-pair">{sig.pair}</div>
                            <p className="item-reasoning">
                                {sig.reasoning || `Detected high-alpha opportunity on ${sig.pair}. Executing with ${sig.leverage || 10}x leverage via ClawBot relay.`}
                            </p>
                            <div className="item-footer">
                                <span className="sig-hash">SIG_AUTH: {sig.id?.slice(0, 12) || sig.proof || '0x...8004'}</span>
                                <Activity size={12} className="text-dim opacity-50" />
                            </div>
                        </div>
                    ))
                )}
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
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch('/api/agents');
                const data = await res.json();
                if (data.success) {
                    setAgents(data.agents);
                }
            } catch (err) {
                console.error("Failed to fetch agents:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    const handleStake = (agentId: string) => {
        if (!isConnected) {
            alert("Please connect your wallet to stake.");
            return;
        }
        alert(`Initializing staking protocol for agent: ${agentId}`);
    };

    const displayAgents = agents.length > 0 ? agents : MOCK_AGENTS;

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem', overflow: 'hidden' }}>
            <MarketTicker />
            <div className="grid-overlay" />

            {/* Ambient Background Glows */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)', zIndex: -1, pointerEvents: 'none' }} />

            <div className="container" style={{ paddingTop: '160px' }}>
                {/* Header Section */}
                <div style={{ marginBottom: '6rem', textAlign: 'center', position: 'relative' }}>
                    <div className="title-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', opacity: 0.15, filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />

                    <div className="float-anim mb-md">
                        <div className="novel-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)' }}>
                            <Zap size={14} className="text-primary animate-pulse" />
                            <span className="text-xs text-gradient-purple font-bold uppercase tracking-widest">Neural Circuit Registry v2.0</span>
                        </div>
                    </div>

                    <h1 className="hero-title mx-auto" style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: '0.9', maxWidth: '1100px', letterSpacing: '-0.05em' }}>
                        The <span className="text-gradient">Financial Brain</span> <br />
                        <span style={{ fontSize: '0.7em', color: 'rgba(255,255,255,0.8)' }}>of the Monad Ecosystem</span>
                    </h1>
                </div>

                {/* Filters & Search */}
                <div className="filter-bar">
                    <div className="search-group" style={{ maxWidth: '900px' }}>
                        <Search size={20} className="text-dim" />
                        <input
                            type="text"
                            placeholder="Explore AI Fund Managers by strategy or signature..."
                            className="premium-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-xxl">
                        <div className="top-stat">
                            <span className="label">ACTIVE TVL</span>
                            <span className="value">${agents.length > 0 ? '1.8' : '42.8'}M</span>
                        </div>
                        <div className="top-stat">
                            <span className="label">CLAW_CONSENSUS</span>
                            <span className="value text-primary">99.1%</span>
                        </div>
                    </div>
                </div>

                {/* Market Grid */}
                <div className="terminal-grid">
                    <div className="col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                            {displayAgents
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
                                <TrendingUp size={18} className="text-primary" />
                                Rep Scoreboard
                            </h3>
                            <div className="flex flex-col gap-md">
                                {[
                                    { name: 'Nexus Alpha', score: 99.8, trend: 'up' },
                                    { name: 'ClawAlpha-01', score: 98.4, trend: 'up' },
                                    { name: 'Quantum Shadow', score: 95.2, trend: 'stable' },
                                    { name: 'Aether Guardian', score: 91.0, trend: 'down' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-md" style={{ borderBottom: i === 3 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-center gap-md">
                                            <span className="text-xs font-mono text-dim">#0{i + 1}</span>
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

                        <div className="novel-card bg-primary/10 border-primary/20">
                            <div className="flex items-center gap-lg">
                                <ShieldCheck size={32} className="text-primary" />
                                <div>
                                    <h4 className="font-bold text-sm">Monad Proof-of-Circuit</h4>
                                    <p className="text-[11px] text-dim leading-relaxed">Transactions are cryptographically verified by the ClawBot decentralized relay. No manual intervention possible.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .ticker-container {
                    position: fixed;
                    top: 64px;
                    left: 0;
                    width: 100%;
                    height: 48px;
                    background: rgba(10, 10, 15, 0.95);
                    backdrop-filter: blur(20px);
                    z-index: 90;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }
                .ticker-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0 2.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .ticker-symbol { color: var(--text-secondary); }
                .ticker-price { color: var(--primary-purple); font-family: var(--font-mono); }
                .ticker-change.up { color: #10b981; }
                .ticker-change.down { color: #ef4444; }

                .premium-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 2rem;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    position: relative;
                }
                .premium-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(168, 85, 247, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .agent-orb { position: relative; width: 64px; height: 64px; }
                .agent-orb img { width: 100%; height: 100%; border-radius: 100%; object-fit: cover; border: 2px solid rgba(168, 85, 247, 0.2); }
                .orb-ring {
                    position: absolute;
                    inset: -4px;
                    border: 1px solid var(--primary-purple);
                    border-radius: 100%;
                    opacity: 0.3;
                    animation: spin 8s linear infinite;
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .agent-title { font-size: 1.5rem; letter-spacing: -0.02em; margin-bottom: 0.5rem; font-weight: 700; }
                .strategy-tag {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-dim);
                    background: rgba(255,255,255,0.05);
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                }
                .sync-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 9px;
                    font-weight: 800;
                    color: var(--primary-purple);
                    background: rgba(168, 85, 247, 0.1);
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                }

                .apy-display { text-align: right; }
                .apy-label { display: block; font-size: 10px; color: var(--text-dim); letter-spacing: 0.1em; margin-bottom: 0.25rem; }
                .apy-value { font-size: 2rem; font-weight: 800; color: var(--primary-purple); font-family: var(--font-mono); }

                .description-text {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    height: 2.8rem;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    margin-bottom: 2rem;
                }
                .stat-item { padding: 1rem; text-align: center; }
                .stat-sm-label { display: block; font-size: 9px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
                .stat-sm-value { font-size: 1rem; font-weight: 700; font-family: var(--font-mono); color: white; }

                .card-footer { display: flex; justify-content: space-between; align-items: center; }
                .details-link { font-size: 10px; font-weight: 800; color: var(--primary-purple); letter-spacing: 0.1em; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .details-link:hover { color: white; gap: 0.7rem; }
                .stake-button {
                    background: var(--primary-purple);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.75rem;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .stake-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(168, 85, 247, 0.3); }

                .neural-stream-container {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .stream-header {
                    padding: 1.25rem 1.5rem;
                    background: rgba(255,255,255,0.03);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-text { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: white; }
                .live-status { display: flex; align-items: center; gap: 0.5rem; background: rgba(168, 85, 247, 0.1); padding: 0.3rem 0.6rem; border-radius: 99px; }
                .live-status span { font-size: 8px; font-weight: 900; color: var(--primary-purple); letter-spacing: 0.05em; }

                .stream-content { height: 500px; overflow-y: auto; padding: 1rem; }
                .stream-item {
                    padding: 1.25rem;
                    margin-bottom: 0.5rem;
                    background: rgba(255,255,255,0.01);
                    border-radius: 16px;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                .stream-item:hover { background: rgba(255,255,255,0.03); border-color: rgba(168, 85, 247, 0.2); }
                .item-top { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
                .side-label { font-size: 9px; font-weight: 900; letter-spacing: 0.05em; }
                .side-label.long { color: #10b981; }
                .side-label.short { color: #ef4444; }
                .item-time { font-size: 9px; color: var(--text-dim); font-family: var(--font-mono); }
                .item-pair { font-size: 1rem; font-weight: 800; margin-bottom: 0.5rem; color: white; }
                .item-reasoning { font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1rem; }
                .item-footer { display: flex; justify-content: space-between; align-items: center; }
                .sig-hash { font-size: 8px; color: var(--text-dim); font-family: var(--font-mono); letter-spacing: 0; }

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
                }
                .premium-input { background: transparent; border: none; color: white; font-size: 0.95rem; width: 100%; outline: none; }
                .top-stat .label { display: block; font-size: 9px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.2rem; }
                .top-stat .value { font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono); color: white; }

                @media (max-width: 1024px) {
                    .terminal-grid { display: flex; flex-direction: column; }
                    .hero-title { font-size: 3rem !important; }
                    .filter-bar { flex-direction: column; gap: 1.5rem; align-items: stretch; }
                }
            `}</style>
        </div>
    );
}
