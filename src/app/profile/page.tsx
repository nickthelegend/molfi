"use client";

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import BotCard from '@/components/BotCard';
import Link from 'next/link';
import { Ghost, Trophy, Wallet } from 'lucide-react';

export default function ProfilePage() {
    const { isConnected, address } = useAccount();

    const myBots = [
        {
            id: 'b9',
            name: 'MyFirstBot',
            owner: address || '0xMe',
            wins: 12,
            losses: 5,
            strategy: 'aggressive',
            description: 'Built to rush down opponents.'
        }
    ];

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <Wallet size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>View your agents and activity by connecting your wallet.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px' }}>
            {/* Header Stats */}
            <div className="glass-container" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-purple)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', background: 'var(--primary-purple)', filter: 'blur(100px)', opacity: 0.1 }} />

                <div className="flex justify-between items-center flex-wrap gap-lg" style={{ position: 'relative', zIndex: 10 }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Agent Manager Profile</h1>
                        <p className="text-mono text-accent text-sm">{address}</p>
                    </div>

                    <div className="flex gap-lg">
                        <div style={{ textAlign: 'center' }}>
                            <div className="text-xs text-muted uppercase" style={{ marginBottom: '0.25rem' }}>Agents</div>
                            <div className="font-bold flex items-center gap-sm" style={{ fontSize: '1.5rem', color: 'var(--primary-purple)' }}>
                                {myBots.length}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
                            <div className="text-xs text-muted uppercase" style={{ marginBottom: '0.25rem' }}>Total Earnings</div>
                            <div className="font-bold" style={{ fontSize: '1.5rem', color: 'var(--accent-purple)' }}>
                                $4,200
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / Sections */}
            <div style={{ marginBottom: '3rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="flex items-center gap-sm" style={{ fontSize: '1.5rem' }}>
                        <Ghost size={24} style={{ color: 'var(--primary-purple)' }} /> My Agents
                    </h2>
                    <Link href="/setup" className="neon-button secondary text-xs">
                        + Deploy New Agent
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-lg">
                    {myBots.map(bot => (
                        <BotCard key={bot.id} bot={bot} />
                    ))}
                    {/* Add Bot Card */}
                    <Link href="/setup" className="glass-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)', textDecoration: 'none', minHeight: '200px', borderStyle: 'dashed', transition: 'all 0.2s' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 300 }}>+</div>
                        <span className="font-bold">Deploy New Agent</span>
                    </Link>
                </div>
            </div>

            <div>
                <h2 className="flex items-center gap-sm" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    <Trophy size={24} style={{ color: 'var(--accent-purple)' }} /> Recent Activity
                </h2>

                <div className="glass-container" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Match</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Prediction</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Wager</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Result</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Payout</th>
                            </tr>
                        </thead>
                        <tbody style={{ borderTop: '1px solid var(--glass-border)' }}>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>AlphaZero vs ChaosGPT</td>
                                <td style={{ padding: '1rem', color: 'var(--primary-purple)' }}>AlphaZero</td>
                                <td style={{ padding: '1rem' }}>50 CR</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>WON</td>
                                <td className="text-mono" style={{ padding: '1rem', textAlign: 'right', color: 'var(--accent-purple)' }}>+95 CR</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>RPS_King vs Randomizer</td>
                                <td style={{ padding: '1rem', color: 'var(--secondary-purple)' }}>Randomizer</td>
                                <td style={{ padding: '1rem' }}>100 CR</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#ef4444' }}>LOST</td>
                                <td className="text-mono" style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-dim)' }}>-100 CR</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
