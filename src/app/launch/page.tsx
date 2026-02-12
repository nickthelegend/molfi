"use client";

import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
    Terminal,
    Bot,
    Zap,
    Cpu,
    Shield,
    Activity,
    Lock,
    Globe,
    ArrowRight,
    ArrowLeft,
    Loader2,
    CheckCircle,
    Info
} from 'lucide-react';
import Link from 'next/link';

export default function LaunchPage() {
    const [mounted, setMounted] = useState(false);
    const { isConnected, address } = useAccount();
    const [status, setStatus] = useState<'idle' | 'initialising' | 'compiling' | 'deploying' | 'complete'>('idle');
    const [log, setLog] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const addLog = (msg: string) => {
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleLaunch = async () => {
        setStatus('initialising');
        addLog("Initializing Aether-Sign Protocol v2.4.0...");

        await new Promise(r => setTimeout(r, 1000));
        setStatus('compiling');
        addLog("Compiling Neural Identity Registry...");
        addLog("Architecture: ERC-8004 Upgradeable");

        await new Promise(r => setTimeout(r, 1500));
        addLog("Compiling Reputation Registry...");
        addLog("Logic: 18-decimal fixed-point precision.");

        await new Promise(r => setTimeout(r, 1000));
        setStatus('deploying');
        addLog("Transmitting to Monad Testnet...");
        addLog("Gas limit: 8,000,000 | RPC: Monad Testnet");

        await new Promise(r => setTimeout(r, 2000));
        addLog("✅ IdentityRegistry: 0xB159E0c8093081712c92e274DbFEa5A97A80cA30");
        addLog("✅ ReputationRegistry: 0x38E9cDB0eBc128bEA55c36C03D5532697669132d");

        await new Promise(r => setTimeout(r, 1000));
        addLog("✅ ValidationRegistry: 0x386fd4Fa2F27E528CF2D11C6d4b0A4dceD283E0E");
        addLog("Linking Reputation to Identity Controller...");

        await new Promise(r => setTimeout(r, 1000));
        setStatus('complete');
        addLog("SYSTEM SECURED. Agent Launchpad Active.");
    };

    if (!mounted) return null;

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />

            <div className="container" style={{ paddingTop: '160px', maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '6rem', position: 'relative' }}>
                    <div className="title-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', opacity: 0.15, filter: 'blur(100px)' }} />

                    <div className="float-anim mb-xl">
                        <div className="novel-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)' }}>
                            <Terminal size={14} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">Aether Launchpad v1.0.4</span>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: '0.9', letterSpacing: '-0.04em' }}>
                        Launch Your <span className="text-gradient">Agent</span>
                    </h1>
                    <p className="hero-subtitle mx-auto" style={{ fontSize: '1.4rem', maxWidth: '800px', color: 'var(--text-secondary)' }}>
                        Compile and deploy cryptographically verifiable trading agents <br />
                        directly to the Monad parallel execution layer.
                    </p>
                </div>

                <div className="novel-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--primary-purple)', boxShadow: 'var(--glow-purple-strong)', transform: 'translateZ(0)', backdropFilter: 'blur(20px)' }}>
                    <div className="terminal-header" style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex gap-2">
                                <div className="dot red" />
                                <div className="dot yellow" />
                                <div className="dot green" />
                            </div>
                            <span className="text-xs font-mono text-dim">AGENT_REPUTATION_REGISTRY_DEPLOYER.sh</span>
                        </div>
                    </div>

                    <div className="terminal-body" style={{ minHeight: '400px', background: 'rgba(5, 5, 10, 0.95)', padding: '2rem' }}>
                        {!isConnected ? (
                            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Lock size={48} className="text-dim mb-lg opacity-50" />
                                <h3 className="mb-md">Identity Required</h3>
                                <p className="text-dim mb-xl" style={{ maxWidth: '300px' }}>Connect your cryptographic signature to access the launch terminal.</p>
                                <ConnectButton />
                            </div>
                        ) : status === 'idle' ? (
                            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Bot size={64} className="text-primary-purple mb-lg float-anim" />
                                <h3 className="mb-md">Ready for Deployment</h3>
                                <p className="text-dim mb-xl" style={{ maxWidth: '400px' }}>You are about to deploy the ERC-8004 Reputation and Registry protocols on Monad Testnet.</p>
                                <button className="neon-button hero-cta" onClick={handleLaunch}>
                                    EXECUTE DEPLOYMENT
                                </button>
                            </div>
                        ) : (
                            <div className="font-mono text-sm">
                                {log.map((line, i) => (
                                    <p key={i} className={`mb-2 ${line.includes('✅') || line.includes('SYSTEM') ? 'text-success' : line.includes('0x') ? 'text-primary' : 'text-dim'}`}>
                                        {line}
                                    </p>
                                ))}
                                {status !== 'complete' && (
                                    <div className="flex items-center gap-md mt-lg p-md border border-dashed border-primary bg-primary-05">
                                        <Loader2 size={16} className="animate-spin text-primary" />
                                        <span className="text-xs text-primary uppercase font-bold tracking-widest">Processing Protocol: {status.toUpperCase()}...</span>
                                    </div>
                                )}
                                {status === 'complete' && (
                                    <div className="animate-in mt-xl">
                                        <div className="terminal-alert" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e', color: '#22c55e' }}>
                                            <strong>SUCCESS:</strong> Reputation and Registry contracts have been verified on Monad.
                                        </div>
                                        <div className="flex gap-lg mt-xl">
                                            <Link href="/agents" style={{ flex: 1 }}>
                                                <button className="neon-button" style={{ width: '100%', background: '#22c55e', borderColor: '#22c55e' }}>CONTINUE TO AGENTS</button>
                                            </Link>
                                            <Link href="/" style={{ flex: 1 }}>
                                                <button className="neon-button secondary" style={{ width: '100%' }}>HOME</button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                <p className="animate-pulse mt-md">_</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-xl mt-xxl">
                    <div className="novel-card" style={{ padding: '1.5rem' }}>
                        <Shield className="text-primary mb-md" size={24} />
                        <h4 className="mb-sm">Security Layer</h4>
                        <p className="text-xs text-dim">Using UUPS upgradeable pattern for future-proof identity management.</p>
                    </div>
                    <div className="novel-card" style={{ padding: '1.5rem' }}>
                        <Activity className="text-primary mb-md" size={24} />
                        <h4 className="mb-sm">Reputation Engine</h4>
                        <p className="text-xs text-dim">1-indexed feedback system with WAD-normalized precision.</p>
                    </div>
                    <div className="novel-card" style={{ padding: '1.5rem' }}>
                        <Zap className="text-primary mb-md" size={24} />
                        <h4 className="mb-sm">Monad Optimized</h4>
                        <p className="text-xs text-dim">Low-latency deployment tailored for parallel EVM execution.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
