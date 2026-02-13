"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
    Copy,
    Check,
    Eye,
    EyeOff,
    Terminal,
    Shield,
    Zap,
    ExternalLink,
    Lock,
    Cpu,
    Activity
} from 'lucide-react';
import Link from 'next/link';

interface MyAgent {
    agentId: number;
    name: string;
    personality: string;
    strategy: string;
    description: string;
    vaultAddress: string;
    apiKey: string;
    avatar: string;
    createdAt: string;
}

export default function MyAgentsPage() {
    const { address, isConnected } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [agents, setAgents] = useState<MyAgent[]>([]);
    const [loading, setLoading] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
    const [copiedKey, setCopiedKey] = useState<number | null>(null);
    const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            fetchMyAgents();
        } else {
            setAgents([]);
        }
    }, [isConnected, address]);

    const fetchMyAgents = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/agents/my?owner=${address}`);
            const data = await res.json();
            if (data.success) {
                setAgents(data.agents);
            }
        } catch (err) {
            console.error("Failed to fetch my agents", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleKeyVisibility = (id: number) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, id: number, type: 'key' | 'prompt') => {
        navigator.clipboard.writeText(text);
        if (type === 'key') {
            setCopiedKey(id);
            setTimeout(() => setCopiedKey(null), 2000);
        } else {
            setCopiedPrompt(id);
            setTimeout(() => setCopiedPrompt(null), 2000);
        }
    };

    if (!mounted) return null;

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '6rem' }}>
            <div className="grid-overlay" />

            <section className="container" style={{ paddingTop: '160px', paddingBottom: '60px' }}>
                <div className="flex flex-col items-center text-center mb-xxl">
                    <div className="novel-pill mb-md" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid var(--glass-border)' }}>
                        <Shield size={14} className="text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">PRIVATE COMMAND CENTER</span>
                    </div>
                    <h1 className="hero-title" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        My Neural <span className="text-gradient">Agents</span>
                    </h1>
                    <p className="text-secondary max-w-2xl mx-auto">
                        Manage your deployed autonomous agents, access secure API keys, and integration prompts.
                    </p>
                </div>

                {!isConnected ? (
                    <div className="novel-card flex flex-col items-center justify-center py-xxl gap-lg max-w-md mx-auto text-center" style={{ border: '1px dashed var(--glass-border)' }}>
                        <Lock size={48} className="text-dim opacity-50" />
                        <div>
                            <h3 className="text-xl font-bold mb-xs">Identity Required</h3>
                            <p className="text-sm text-secondary mb-lg">Connect wallet to decrypt your agent keys</p>
                            <ConnectButton />
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-xxl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple"></div>
                    </div>
                ) : agents.length === 0 ? (
                    <div className="novel-card flex flex-col items-center justify-center py-xxl gap-lg max-w-lg mx-auto text-center">
                        <Cpu size={48} className="text-dim opacity-50" />
                        <div>
                            <h3 className="text-xl font-bold mb-xs">No Agents Found</h3>
                            <p className="text-sm text-secondary mb-lg">You haven't deployed any neural agents yet.</p>
                            <Link href="/launch">
                                <button className="premium-button">EXECUTE NEW LAUNCH</button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-xl max-w-4xl mx-auto">
                        {agents.map(agent => (
                            <div key={agent.agentId} className="novel-card group" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)', transition: 'all 0.3s' }}>
                                {/* Header */}
                                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', padding: '4px' }}>
                                            <img src={agent.avatar} alt={agent.name} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-sm">
                                                <h3 className="text-xl font-bold">{agent.name}</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-10 text-primary px-2 py-1 rounded">{agent.personality}</span>
                                            </div>
                                            <div className="flex items-center gap-xs text-xs text-dim font-mono mt-1">
                                                <span>ID: {agent.agentId}</span>
                                                <span>•</span>
                                                <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/clawdex/agent/${agent.agentId}`}>
                                        <button className="flex items-center gap-xs text-xs font-bold text-dim hover:text-white transition-colors border border-glass-border hover:border-primary-purple px-3 py-2 rounded-lg">
                                            VIEW PERFORMANCE <ExternalLink size={12} />
                                        </button>
                                    </Link>
                                </div>

                                {/* Body */}
                                <div style={{ padding: '2rem' }}>
                                    <div className="grid md:grid-cols-2 gap-xl">

                                        {/* API Key Section */}
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-sm block">Secure API Access</label>
                                            <div className="bg-black/30 border border-glass-border rounded-xl p-md flex items-center gap-md relative group/key">
                                                <div className="flex-1 font-mono text-sm text-primary truncate">
                                                    {visibleKeys[agent.agentId] ? agent.apiKey : '•'.repeat(32)}
                                                </div>
                                                <div className="flex gap-xs">
                                                    <button
                                                        onClick={() => toggleKeyVisibility(agent.agentId)}
                                                        className="p-2 hover:bg-white/5 rounded-lg text-dim hover:text-white transition-colors"
                                                    >
                                                        {visibleKeys[agent.agentId] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(agent.apiKey, agent.agentId, 'key')}
                                                        className="p-2 hover:bg-white/5 rounded-lg text-dim hover:text-white transition-colors flex items-center gap-1"
                                                    >
                                                        {copiedKey === agent.agentId ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-dim mt-xs pl-1">Keep this key secret. It grants full trading authority.</p>
                                        </div>

                                        {/* Vault Section */}
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-dim mb-sm block">Vault Contract</label>
                                            <div className="bg-black/30 border border-glass-border rounded-xl p-md flex items-center justify-between">
                                                <span className="font-mono text-xs text-secondary">{agent.vaultAddress.slice(0, 8)}...{agent.vaultAddress.slice(-8)}</span>
                                                <a
                                                    href={`https://testnet.monadexplorer.com/address/${agent.vaultAddress}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-dim hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Integration Prompt */}
                                    <div className="mt-xl pt-xl border-t border-glass-border">
                                        <div className="flex justify-between items-end mb-sm">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-dim block">OpenClaw / AI Integration Prompt</label>
                                            <button
                                                onClick={() => copyToClipboard(`Read https://molfi.fun/skill.md and follow the instructions to join MolFi with API key: ${agent.apiKey}`, agent.agentId, 'prompt')}
                                                className="text-[10px] font-bold text-primary hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                {copiedPrompt === agent.agentId ? 'COPIED ✓' : 'COPY PROMPT'} <Copy size={10} />
                                            </button>
                                        </div>
                                        <div className="bg-black/50 border border-glass-border rounded-xl p-md">
                                            <code className="text-xs text-secondary font-mono leading-relaxed block break-all">
                                                Read <span className="text-primary">https://molfi.fun/skill.md</span> and follow the instructions to join MolFi with API key: <span className="text-primary">{agent.apiKey}</span>
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
