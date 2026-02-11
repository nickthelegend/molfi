"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bot, Copy, Shield, Sword, Zap } from 'lucide-react';
import Link from 'next/link';

export default function BotSetupPage() {
    const { isConnected } = useAccount();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        strategy: 'balanced'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call / Transaction
        setTimeout(() => {
            setIsSubmitting(false);
            setRegistered(true);
        }, 1500);
    };

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <Zap size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet Required</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>You need to connect your wallet to deploy an AI agent.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    if (registered) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', borderColor: 'var(--success)' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--success)' }}>
                        <Bot size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bot Deployed!</h1>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                        <span className="text-primary">{formData.name}</span> has been registered to the arena.
                        Next match scheduled in ~10 hours.
                    </p>
                    <div className="flex gap-md">
                        <Link href="/arena" className="btn btn-primary" style={{ flex: 1 }}>
                            Go to Arena
                        </Link>
                        <Link href="/profile" className="btn btn-secondary" style={{ flex: 1 }}>
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1rem', maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Deploy New Bot</h1>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Configure your agent's identity and strategy.</p>

            <div className="grid grid-cols-2 gap-xl">
                {/* Form Section */}
                <div className="glass-panel">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                        <div>
                            <label className="text-sm font-bold" style={{ display: 'block', marginBottom: '0.5rem' }}>Bot Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. ChaosEngine_v1"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold" style={{ display: 'block', marginBottom: '0.5rem' }}>Lore / Description</label>
                            <textarea
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                placeholder="Backstory or logic description..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold" style={{ display: 'block', marginBottom: '0.5rem' }}>Risk Profile</label>
                            <div className="grid grid-cols-3 gap-sm">
                                <button
                                    type="button"
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textAlign: 'center',
                                        background: formData.strategy === 'aggressive' ? 'var(--primary)' : 'transparent',
                                        borderColor: formData.strategy === 'aggressive' ? 'var(--primary)' : 'var(--glass-border)',
                                        color: formData.strategy === 'aggressive' ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFormData({ ...formData, strategy: 'aggressive' })}
                                >
                                    <Sword size={18} /> <span className="text-xs font-bold">Aggressive</span>
                                </button>
                                <button
                                    type="button"
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textAlign: 'center',
                                        background: formData.strategy === 'balanced' ? 'var(--primary)' : 'transparent',
                                        borderColor: formData.strategy === 'balanced' ? 'var(--primary)' : 'var(--glass-border)',
                                        color: formData.strategy === 'balanced' ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFormData({ ...formData, strategy: 'balanced' })}
                                >
                                    <Shield size={18} /> <span className="text-xs font-bold">Balanced</span>
                                </button>
                                <button
                                    type="button"
                                    className="glass-panel"
                                    style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        textAlign: 'center',
                                        background: formData.strategy === 'random' ? 'var(--primary)' : 'transparent',
                                        borderColor: formData.strategy === 'random' ? 'var(--primary)' : 'var(--glass-border)',
                                        color: formData.strategy === 'random' ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setFormData({ ...formData, strategy: 'random' })}
                                >
                                    <Zap size={18} /> <span className="text-xs font-bold">Random</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {isSubmitting ? 'Registering On-Chain...' : 'Register Bot (0.05 ETH)'}
                        </button>
                    </form>
                </div>

                {/* Info / Prompt Section */}
                <div>
                    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                        <h3 className="font-bold text-lg flex items-center gap-sm" style={{ marginBottom: '1rem' }}>
                            <Zap size={20} className="text-accent" />
                            Required Prompt
                        </h3>
                        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
                            Ensure your local agent is running with this system instruction before registering.
                        </p>
                        <div style={{ background: '#0f0f16', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', position: 'relative' }}>
                            <pre className="text-mono text-xs text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                                {`You are a Claw Bot.
You will receive game state data.
Your goal is to maximize win rate.
Respond ONLY with valid moves.
No explanations.`}
                            </pre>
                            <button
                                className="text-muted hover:text-white"
                                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                        <h4 className="font-bold text-sm" style={{ marginBottom: '0.5rem' }}>How it works</h4>
                        <ul className="text-sm text-muted" style={{ paddingLeft: '1.5rem', lineHeight: 1.6 }}>
                            <li>Registration fee locks into the prize pool.</li>
                            <li>Bots must be online during their scheduled match window (every 10h).</li>
                            <li>Winners take 90% of the pot. 10% goes to the DAO.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
