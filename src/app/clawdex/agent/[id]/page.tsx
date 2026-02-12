"use client";

import { useState, useEffect, use } from 'react';
import { useAccount } from 'wagmi';
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
    ArrowLeft,
    CheckCircle2,
    Clock,
    DollarSign,
    Percent
} from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TradingViewChart from '@/components/TradingViewChart';
import { MOCK_AGENTS, AIAgent } from '@/lib/agents';

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <p className="text-secondary">Loading Agent Intelligence...</p>
            </div>
        </div>
    );

    return <AgentDetailPageContent id={id} />;
}

function AgentDetailPageContent({ id }: { id: string }) {
    const [agent, setAgent] = useState<AIAgent | null>(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const { isConnected, address } = useAccount();

    useEffect(() => {
        const activeAgent = MOCK_AGENTS.find(a => a.id === id);
        if (activeAgent) setAgent(activeAgent);
    }, [id]);

    if (!agent) return null;

    const handleStake = () => {
        if (!isConnected) {
            alert("Please connect your wallet to stake.");
            return;
        }
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            alert("Please enter a valid amount to stake.");
            return;
        }
        alert(`Successfully staked ${stakeAmount} USDT into ${agent.name}! Protocol initializing...`);
        setStakeAmount('');
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />

            <div className="container pt-xl">
                {/* Navigation & Top Bar */}
                <div className="flex items-center justify-between mb-xl">
                    <Link href="/clawdex" className="glass-icon-button" style={{ width: 'auto', padding: '0 1rem', display: 'flex', gap: '0.5rem' }}>
                        <ArrowLeft size={18} />
                        <span className="text-sm font-bold">BACK TO CLAW DEX</span>
                    </Link>
                    <div className="flex items-center gap-md">
                        <span className="status-badge active flex items-center gap-xs">
                            <Activity size={14} /> LIVE PROTOCOL
                        </span>
                        <ConnectButton />
                    </div>
                </div>

                {/* Hero Header */}
                <div className="novel-card mb-xl">
                    <div className="flex flex-col md:flex-row items-center gap-xl">
                        <div className="novel-avatar-container" style={{ width: '120px', height: '120px' }}>
                            <img src={agent.avatar} alt={agent.name} className="novel-avatar" style={{ borderRadius: '24px' }} />
                            <div className="trust-badge" style={{ width: '32px', height: '32px' }}>
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{agent.name}</h1>
                            <div className="flex items-center justify-center gap-xl mb-md">
                                <span className="text-secondary flex items-center gap-sm">
                                    <Bot size={18} className="text-primary" /> {agent.strategy}
                                </span>
                                <span className="text-secondary flex items-center gap-sm">
                                    <Globe size={18} className="text-primary" /> Multi-Exchange
                                </span>
                            </div>
                            <p className="text-dim" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                {agent.description}
                            </p>
                        </div>
                        <div className="novel-card" style={{ minWidth: '250px', background: 'rgba(168, 85, 247, 0.1)' }}>
                            <div className="text-center">
                                <span className="text-xs text-dim uppercase block mb-xs">Estimated APY</span>
                                <h2 className="text-gradient" style={{ fontSize: '2.5rem' }}>{agent.apy}%</h2>
                                <div className="mt-sm pt-sm border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <span className="text-sm text-success font-bold">+2.4% last 24h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="terminal-grid">
                    {/* Left: Chart & Stats */}
                    <div className="col-span-8">
                        <div className="novel-card mb-xl" style={{ padding: '0' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <h3 className="flex items-center gap-sm">
                                    <TrendingUp size={20} className="text-primary" />
                                    PERFORMANCE METRICS
                                </h3>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <TradingViewChart pair="ETH/USDT" height={450} />
                            </div>
                        </div>

                        {/* Recent Positions Table */}
                        <div className="novel-card">
                            <h3 className="mb-lg">LIVE POSITION TRACKER</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>ASSET</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>SIDE</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>ENTRY PRICE</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>UNREALIZED PnL</th>
                                            <th style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agent.activePositions.map((pos) => (
                                            <tr key={pos.id} style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.05)' }}>
                                                <td style={{ padding: '1rem' }} className="font-bold">{pos.pair}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className={`action-badge ${pos.side}`}>
                                                        {pos.side}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }} className="font-mono">${pos.entryPrice}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="text-success font-bold font-mono">
                                                        +${pos.pnl} ({pos.pnlPercent}%)
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <ArrowUpRight size={16} className="text-primary cursor-pointer" />
                                                </td>
                                            </tr>
                                        ))}
                                        {agent.activePositions.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                    No active positions found. Agent is currently liquidating or in neutral state.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Verified Decisions & Staking */}
                    <div className="col-span-4 flex flex-col gap-xl">
                        {/* Staking Panel */}
                        <div className="novel-card" style={{ border: '1px solid var(--primary-purple)', boxShadow: 'var(--glow-purple)' }}>
                            <h3 className="mb-md flex items-center gap-sm">
                                <DollarSign size={20} className="text-primary" />
                                DEPOSIT CAPITAL
                            </h3>
                            <p className="text-xs text-secondary mb-xl">
                                Deposit USDT into the Aether-Sign Protocol. Funds are managed by the agent's smart contract and can be withdrawn after the lock period.
                            </p>

                            <div className="mb-xl">
                                <div className="flex justify-between mb-sm">
                                    <label className="text-xs font-bold text-dim uppercase">Amount (USDT)</label>
                                    <span className="text-xs text-primary underline cursor-pointer">MAX 5,000</span>
                                </div>
                                <div className="novel-search-container" style={{ borderRadius: '12px' }}>
                                    <span style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="novel-search-input"
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-md mb-xl">
                                <div className="flex justify-between text-sm">
                                    <span className="text-dim">Protocol Fee</span>
                                    <span>0.1%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-dim">Lock Period</span>
                                    <span>24 Hours</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold pt-sm border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <span>Expected Yield</span>
                                    <span className="text-gradient">+{((parseFloat(stakeAmount) || 0) * (agent.apy / 36500)).toFixed(4)} USDT / DAY</span>
                                </div>
                            </div>

                            <button className="neon-button" style={{ width: '100%' }} onClick={handleStake}>
                                CONFIRM STAKE
                            </button>
                        </div>

                        {/* Decision Timeline */}
                        <div className="novel-card">
                            <h3 className="mb-xl flex items-center gap-sm">
                                <ShieldCheck size={20} className="text-primary" />
                                VERIFIED DECISIONS
                            </h3>
                            <div className="timeline">
                                {agent.recentDecisions.map((dec, i) => (
                                    <div key={dec.id} className="timeline-item">
                                        <div className="timeline-marker" />
                                        <div className="timeline-content">
                                            <div className="flex items-center justify-between mb-xs">
                                                <span className={`text-xs font-bold uppercase ${dec.action === 'BUY' ? 'text-success' : 'text-primary'}`}>
                                                    {dec.action} SIGNAL @ ${dec.price}
                                                </span>
                                                <span className="text-xs text-dim">
                                                    {Math.floor((Date.now() - dec.timestamp) / 60000)}m ago
                                                </span>
                                            </div>
                                            <p className="text-xs text-secondary mb-sm">{dec.reasoning}</p>
                                            <div className="flex items-center gap-xs">
                                                <CheckCircle2 size={12} className="text-success" />
                                                <span className="text-xs font-mono text-dim" style={{ fontSize: '0.6rem' }}>
                                                    BLOCK HASH: {dec.proof}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .timeline {
                    position: relative;
                    padding-left: 20px;
                }
                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(to bottom, var(--primary-purple), transparent);
                }
                .timeline-item {
                    position: relative;
                    margin-bottom: 2rem;
                }
                .timeline-marker {
                    position: absolute;
                    left: -25px;
                    top: 0;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--primary-purple);
                    box-shadow: var(--glow-purple);
                    border: 2px solid var(--bg-card);
                }
                .timeline-content {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(168, 85, 247, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                }
                .novel-avatar-container {
                    position: relative;
                }
                .novel-avatar {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .trust-badge {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                }
                .action-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 0.2rem 0.6rem;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .action-badge.long { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981; }
                .action-badge.short { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }
                
                table th {
                    border-bottom: 1px solid var(--glass-border);
                    letter-spacing: 0.05em;
                }
                table tr:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
}
