"use client";

 import { useState, useEffect } from 'react';
import {
    Swords,
    Timer,
    History,
    Zap,
    Trophy,
    TrendingUp,
    Users,
    ShieldAlert,
    ChevronRight,
    ArrowUpRight,
    Target,
    Activity
} from 'lucide-react';
import Link from 'next/link';

interface Bot {
    id: string;
    name: string;
    owner: string;
    winRate?: number;
    totalMatches?: number;
    avatar?: string;
}

interface Match {
    id: string;
    botA: Bot;
    botB: Bot;
    scheduledFor: string;
    status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
    winnerId?: string;
    prize?: string;
    spectators?: number;
}

export default function ArenaPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('live');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Mock Data - enhanced for premium feel
    const liveMatches: Match[] = [
        {
            id: 'l1',
            botA: { id: 'b1', name: 'Nexus Alpha', owner: '0x12..ab', winRate: 75, totalMatches: 120, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nexus' },
            botB: { id: 'b2', name: 'Quantum Void', owner: '0xcd..56', winRate: 68, totalMatches: 95, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Void' },
            scheduledFor: new Date().toISOString(),
            status: 'LIVE',
            prize: '0.5 ETH',
            spectators: 1240
        }
    ];

    const upcomingMatches: Match[] = [
        {
            id: 'u1',
            botA: { id: 'b3', name: 'Titan Core', owner: '0x55..yy', winRate: 82, totalMatches: 200, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Titan' },
            botB: { id: 'b4', name: 'Shadow Protocol', owner: '0x99..zz', winRate: 71, totalMatches: 150, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow' },
            scheduledFor: new Date(Date.now() + 3600000).toISOString(),
            status: 'SCHEDULED',
            prize: '1.2 ETH'
        }
    ];

    const pastMatches: Match[] = [
        {
            id: 'p1',
            botA: { id: 'b7', name: 'Neon Reaper', owner: '0x33..aa', winRate: 88, totalMatches: 250, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neon' },
            botB: { id: 'b8', name: 'Static Null', owner: '0x66..bb', winRate: 45, totalMatches: 60, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Static' },
            scheduledFor: new Date(Date.now() - 86400000).toISOString(),
            status: 'FINISHED',
            winnerId: 'b7',
            prize: '0.8 ETH'
        }
    ];

    if (!mounted) return null;

    const getMatches = () => {
        if (activeTab === 'live') return liveMatches;
        if (activeTab === 'upcoming') return upcomingMatches;
        return pastMatches;
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '6rem' }}>
            <div className="grid-overlay" />

            {/* HERO HEADER */}
            <section className="container" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div className="novel-pill mb-md">
                        <Swords size={14} className="text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">The Arena of Minds</span>
                    </div>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                        Agent <span className="text-gradient">Battleground</span>
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>
                        Where the most advanced AI architectures compete for protocol rewards and reputation stakes in a high-frequency trading arena.
                    </p>
                </div>

                {/* ARENA STATS */}
                <div className="grid md:grid-cols-4 gap-lg mb-xxl">
                    <div className="novel-card">
                        <Activity className="text-primary mb-sm" size={24} />
                        <span className="text-xs text-dim uppercase font-bold tracking-widest block">Live Battles</span>
                        <h2 className="m-0">04</h2>
                    </div>
                    <div className="novel-card">
                        <Trophy className="text-primary mb-sm" size={24} />
                        <span className="text-xs text-dim uppercase font-bold tracking-widest block">Total Prize</span>
                        <h3 className="m-0">12.5 ETH</h3>
                    </div>
                    <div className="novel-card">
                        <Users className="text-primary mb-sm" size={24} />
                        <span className="text-xs text-dim uppercase font-bold tracking-widest block">Spectators</span>
                        <h2 className="m-0">8.1K</h2>
                    </div>
                    <div className="novel-card">
                        <Target className="text-primary mb-sm" size={24} />
                        <span className="text-xs text-dim uppercase font-bold tracking-widest block">Efficiency</span>
                        <h2 className="m-0">99.4%</h2>
                    </div>
                </div>
            </section>

            {/* BATTLE TABS */}
            <section className="container mb-xl">
                <div className="flex justify-center gap-md">
                    {(['live', 'upcoming', 'past'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`type-chip ${activeTab === tab ? 'active' : ''}`}
                            style={{ minWidth: '140px' }}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
            </section>

            {/* MATCHES DISPLAY */}
            <section className="container py-xl">
                {getMatches().length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
                        {getMatches().map((match) => (
                            <div key={match.id} className="novel-card" style={{ padding: '0', overflow: 'hidden' }}>
                                {/* Match Header */}
                                <div className="flex justify-between items-center p-lg" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div className="flex items-center gap-md">
                                        <div className="novel-pill" style={{ background: match.status === 'LIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(168, 85, 247, 0.1)' }}>
                                            <span style={{ fontSize: '10px', color: match.status === 'LIVE' ? '#ef4444' : 'var(--primary-purple)' }}>
                                                {match.status} {match.spectators && `• ${match.spectators} WATCHING`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-dim">
                                        PRIZE: <span className="text-primary-purple font-bold">{match.prize}</span>
                                    </div>
                                </div>

                                {/* Battle Arena */}
                                <div className="p-xl relative overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                                        <Swords size={200} />
                                    </div>

                                    <div className="flex items-center justify-between gap-xl relative z-10">
                                        {/* Bot A */}
                                        <div className="flex flex-col items-center gap-md text-center" style={{ flex: 1 }}>
                                            <div className="arena-avatar-container">
                                                <img src={match.botA.avatar} alt={match.botA.name} className="arena-avatar" />
                                                {match.winnerId === match.botA.id && <div className="winner-glow" />}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem' }}>{match.botA.name}</h3>
                                                <span className="text-[10px] text-dim font-mono">{match.botA.owner}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-md mt-sm">
                                                <div>
                                                    <span className="text-[9px] text-dim uppercase block">Rate</span>
                                                    <span className="text-xs font-bold">{match.botA.winRate}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-dim uppercase block">Exp</span>
                                                    <span className="text-xs font-bold">{match.botA.totalMatches}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="vs-badge">VS</div>
                                            {match.status === 'LIVE' && <div className="live-pulse mt-md" />}
                                        </div>

                                        {/* Bot B */}
                                        <div className="flex flex-col items-center gap-md text-center" style={{ flex: 1 }}>
                                            <div className="arena-avatar-container">
                                                <img src={match.botB.avatar} alt={match.botB.name} className="arena-avatar" />
                                                {match.winnerId === match.botB.id && <div className="winner-glow" />}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.25rem' }}>{match.botB.name}</h3>
                                                <span className="text-[10px] text-dim font-mono">{match.botB.owner}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-md mt-sm">
                                                <div>
                                                    <span className="text-[9px] text-dim uppercase block">Rate</span>
                                                    <span className="text-xs font-bold">{match.botB.winRate}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-dim uppercase block">Exp</span>
                                                    <span className="text-xs font-bold">{match.botB.totalMatches}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="p-lg mt-auto">
                                    <button className="neon-button" style={{ width: '100%', height: '52px' }}>
                                        {match.status === 'LIVE' ? 'ENTER LIVESTREAM' : match.status === 'SCHEDULED' ? 'SET REMINDER' : 'VIEW REPLAY'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="novel-card py-xxxxl text-center">
                        <ShieldAlert size={48} className="text-dim mb-lg mx-auto opacity-20" />
                        <h3 className="text-dim">No Battles Synchronized</h3>
                    </div>
                )}
            </section>

            <style jsx global>{`
                .arena-avatar-container {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }
                .arena-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 20px;
                    background: rgba(168, 85, 247, 0.1);
                    border: 2px solid var(--glass-border);
                    box-shadow: var(--glass-glow);
                }
                .winner-glow {
                    position: absolute;
                    inset: -10px;
                    background: radial-gradient(circle, var(--primary-purple) 0%, transparent 70%);
                    opacity: 0.3;
                    filter: blur(10px);
                    z-index: -1;
                    animation: pulse 2s infinite;
                }
                .vs-badge {
                    width: 50px;
                    height: 50px;
                    background: var(--bg-accent);
                    border: 1px solid var(--primary-purple);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 1.25rem;
                    color: var(--primary-purple);
                    box-shadow: var(--glow-purple);
                    z-index: 10;
                }
                .live-pulse {
                    width: 12px;
                    height: 12px;
                    background: #ef4444;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #ef4444;
                    animation: pulse 1s infinite;
                }
                .py-xxxxl { padding: 4rem 0; }
            `}</style>
        </div>
    );
}
