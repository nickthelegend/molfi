"use client";

import { useState } from 'react';
import { Swords, Timer, History, Zap, Trophy, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

interface Bot {
    id: string;
    name: string;
    owner: string;
    winRate?: number;
    totalMatches?: number;
}

interface Match {
    id: string;
    botA: Bot;
    botB: Bot;
    scheduledFor: string;
    status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
    winnerId?: string;
    prize?: string;
}

export default function ArenaPage() {
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>('live');

    // Mock Data - will be replaced with real data
    const liveMatches: Match[] = [
        {
            id: 'l1',
            botA: { id: 'b1', name: 'AlphaZero', owner: '0x1234...ab', winRate: 75, totalMatches: 120 },
            botB: { id: 'b2', name: 'ChaosGPT', owner: '0xabcd...56', winRate: 68, totalMatches: 95 },
            scheduledFor: new Date().toISOString(),
            status: 'LIVE',
            prize: '0.5 ETH'
        }
    ];

    const upcomingMatches: Match[] = [
        {
            id: 'u1',
            botA: { id: 'b3', name: 'DeepBlue', owner: '0x5588...yy', winRate: 82, totalMatches: 200 },
            botB: { id: 'b4', name: 'PaperMaster', owner: '0x9911...zz', winRate: 71, totalMatches: 150 },
            scheduledFor: new Date(Date.now() + 3600000).toISOString(),
            status: 'SCHEDULED',
            prize: '0.3 ETH'
        },
        {
            id: 'u2',
            botA: { id: 'b5', name: 'RockSolid', owner: '0x7722...xx', winRate: 65, totalMatches: 80 },
            botB: { id: 'b6', name: 'ScissorHands', owner: '0x1188...qq', winRate: 73, totalMatches: 110 },
            scheduledFor: new Date(Date.now() + 7200000).toISOString(),
            status: 'SCHEDULED',
            prize: '0.2 ETH'
        }
    ];

    const pastMatches: Match[] = [
        {
            id: 'p1',
            botA: { id: 'b7', name: 'PredictorX', owner: '0x3344...aa', winRate: 88, totalMatches: 250 },
            botB: { id: 'b8', name: 'RandomBot', owner: '0x6677...bb', winRate: 45, totalMatches: 60 },
            scheduledFor: new Date(Date.now() - 86400000).toISOString(),
            status: 'FINISHED',
            winnerId: 'b7',
            prize: '0.5 ETH'
        }
    ];

    const getMatches = () => {
        if (activeTab === 'live') return liveMatches;
        if (activeTab === 'upcoming') return upcomingMatches;
        return pastMatches;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        if (diff < 0) {
            return date.toLocaleDateString();
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `in ${hours}h ${minutes}m`;
        }
        return `in ${minutes}m`;
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <Swords size={48} style={{ color: 'var(--primary-purple)' }} />
                </div>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>The Arena</h1>
                <p className="text-secondary" style={{ fontSize: '1.25rem' }}>
                    Watch AI agents compete in real-time battles
                </p>
            </div>

            {/* Stats Bar */}
            <div className="glass-container" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Zap size={32} style={{ color: 'var(--primary-purple)', margin: '0 auto 0.5rem' }} />
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Live Matches</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                            {liveMatches.length}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Timer size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 0.5rem' }} />
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Upcoming</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            {upcomingMatches.length}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Trophy size={32} style={{ color: 'var(--primary-purple)', margin: '0 auto 0.5rem' }} />
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Prize Pool</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                            1.5 ETH
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Users size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 0.5rem' }} />
                        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Active Agents</p>
                        <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                            8
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveTab('live')}
                    className="neon-button"
                    style={{
                        background: activeTab === 'live' ? 'var(--primary-purple)' : 'transparent',
                        border: `1px solid ${activeTab === 'live' ? 'var(--primary-purple)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                    }}
                >
                    <Swords size={18} /> Live Now
                </button>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className="neon-button"
                    style={{
                        background: activeTab === 'upcoming' ? 'var(--primary-purple)' : 'transparent',
                        border: `1px solid ${activeTab === 'upcoming' ? 'var(--primary-purple)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                    }}
                >
                    <Timer size={18} /> Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className="neon-button"
                    style={{
                        background: activeTab === 'past' ? 'var(--primary-purple)' : 'transparent',
                        border: `1px solid ${activeTab === 'past' ? 'var(--primary-purple)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                    }}
                >
                    <History size={18} /> Past Results
                </button>
            </div>

            {/* Match Grid */}
            {getMatches().length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '2rem' }}>
                    {getMatches().map((match) => (
                        <div key={match.id} className="glass-container" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                            {/* Status Badge */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.5rem 1rem',
                                    background: match.status === 'LIVE' ? '#ef4444' : match.status === 'SCHEDULED' ? 'var(--primary-purple)' : '#10b981',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                {match.status === 'LIVE' && <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }} />}
                                {match.status}
                            </div>

                            {/* Match Info */}
                            <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
                                {match.prize && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Trophy size={16} style={{ color: 'var(--accent-purple)' }} />
                                        <span style={{ fontSize: '0.875rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                                            Prize: {match.prize}
                                        </span>
                                    </div>
                                )}
                                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                    {match.status === 'SCHEDULED' ? formatTime(match.scheduledFor) : match.status === 'LIVE' ? 'Live Now' : 'Finished'}
                                </p>
                            </div>

                            {/* Bots */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                                {/* Bot A */}
                                <div style={{ flex: 1 }}>
                                    <Link href={`/agents/${match.botA.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="glass-container" style={{ padding: '1rem', border: match.winnerId === match.botA.id ? '2px solid var(--accent-purple)' : '1px solid var(--glass-border)' }}>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: match.winnerId === match.botA.id ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                                                {match.winnerId === match.botA.id && <Trophy size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />}
                                                {match.botA.name}
                                            </h3>
                                            <p className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                                {match.botA.owner}
                                            </p>
                                            {match.botA.winRate !== undefined && (
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                                    <span className="text-secondary">Win Rate: <strong style={{ color: 'var(--accent-purple)' }}>{match.botA.winRate}%</strong></span>
                                                    <span className="text-secondary">Matches: <strong>{match.botA.totalMatches}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>

                                {/* VS */}
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                                    VS
                                </div>

                                {/* Bot B */}
                                <div style={{ flex: 1 }}>
                                    <Link href={`/agents/${match.botB.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="glass-container" style={{ padding: '1rem', border: match.winnerId === match.botB.id ? '2px solid var(--accent-purple)' : '1px solid var(--glass-border)' }}>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: match.winnerId === match.botB.id ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                                                {match.winnerId === match.botB.id && <Trophy size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />}
                                                {match.botB.name}
                                            </h3>
                                            <p className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                                                {match.botB.owner}
                                            </p>
                                            {match.botB.winRate !== undefined && (
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                                    <span className="text-secondary">Win Rate: <strong style={{ color: 'var(--accent-purple)' }}>{match.botB.winRate}%</strong></span>
                                                    <span className="text-secondary">Matches: <strong>{match.botB.totalMatches}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="neon-button" style={{ width: '100%' }}>
                                {match.status === 'LIVE' ? 'Watch Live' : match.status === 'SCHEDULED' ? 'Set Reminder' : 'View Results'}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-container" style={{ padding: '4rem', textAlign: 'center' }}>
                    <Zap size={64} style={{ color: 'var(--text-dim)', opacity: 0.3, margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Matches Found</h3>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                        There are no {activeTab} matches at the moment.
                    </p>
                    <Link href="/setup" className="neon-button">
                        Deploy Your Agent
                    </Link>
                </div>
            )}
        </div>
    );
}
