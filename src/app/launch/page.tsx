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
    const [status, setStatus] = useState<'idle' | 'configuring' | 'initialising' | 'compiling' | 'deploying' | 'complete'>('idle');
    const [log, setLog] = useState<string[]>([]);
    const [agentDetails, setAgentDetails] = useState({
        name: '',
        strategy: 'Neural Momentum',
        description: '',
        personality: 'Aggressive'
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const addLog = (msg: string) => {
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const handleLaunch = async () => {
        setStatus('initialising');
        addLog(`Initializing ${agentDetails.name} Protocol v2.4.0...`);

        await new Promise(r => setTimeout(r, 1000));
        setStatus('compiling');
        addLog(`Compiling Neural Identity Registry for ${agentDetails.name}...`);
        addLog("Architecture: ERC-8004 Upgradeable");

        await new Promise(r => setTimeout(r, 1500));
        addLog(`Synchronizing ${agentDetails.strategy} Logic...`);
        addLog(`Applying ${agentDetails.personality} Risk Profile...`);

        await new Promise(r => setTimeout(r, 1000));
        setStatus('deploying');
        addLog("Transmitting to Monad Testnet...");
        addLog("Gas limit: 12,000,000 | RPC: Monad Testnet");

        await new Promise(r => setTimeout(r, 2000));
        addLog(`✅ ${agentDetails.name}_IdentityRegistry: 0xB159E0c8093081712c92e274DbFEa5A97A80cA30`);
        addLog("✅ ReputationRegistry: 0x38E9cDB0eBc128bEA55c36C03D5532697669132d");

        await new Promise(r => setTimeout(r, 1000));
        addLog("✅ ClawBot_Bridge: 0x386fd4Fa2F27E528CF2D11C6d4b0A4dceD283E0E");
        addLog("Linking Neural Core to Monad Execution Layer...");

        await new Promise(r => setTimeout(r, 1000));
        setStatus('complete');
        addLog(`${agentDetails.name.toUpperCase()} HAS ACHIEVED CONSCIOUSNESS. Trading Link Active.`);
    };

    if (!mounted) return null;

    const userAvatar = address ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}` : '';
    const agentAvatar = agentDetails.name ? `https://api.dicebear.com/7.x/bottts/svg?seed=${agentDetails.name}` : `https://api.dicebear.com/7.x/bottts/svg?seed=placeholder`;

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />

            <div className="container" style={{ paddingTop: '160px', maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '6rem', position: 'relative' }}>
                    <div className="title-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', opacity: 0.15, filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

                    <div className="float-anim mb-xl">
                        <div className="novel-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)' }}>
                            <Bot size={14} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gradient-purple">Molfi Agent Factory v1.0.4</span>
                        </div>
                    </div>
                    <h1 style={{ fontSize: '5rem', marginBottom: '1.5rem', lineHeight: '0.9', letterSpacing: '-0.04em' }}>
                        Launch Your <span className="text-gradient">Agent</span>
                    </h1>
                    <p className="hero-subtitle mx-auto" style={{ fontSize: '1.4rem', maxWidth: '800px', color: 'var(--text-secondary)' }}>
                        Configure, compile and deploy autonomous trading agents <br />
                        connected via ClawBot to the Monad parallel execution layer.
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
                            <span className="text-xs font-mono text-dim">AGENT_NEURAL_SYNTHESIZER.sh</span>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div className="flex items-center justify-between p-lg novel-card" style={{ background: 'rgba(168, 85, 247, 0.05)' }}>
                                    <div className="flex items-center gap-lg">
                                        <div style={{ width: '80px', height: '80px', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--primary-purple)', boxShadow: 'var(--glow-purple-small)' }}>
                                            <img src={userAvatar} alt="User" style={{ width: '100%', height: '100%' }} />
                                        </div>
                                        <div>
                                            <span className="text-xs text-dim block mb-xs uppercase font-bold tracking-widest">Connected Wallet</span>
                                            <p className="font-mono text-primary text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-md">
                                        <div className="pulse-dot" />
                                        <span className="text-xs font-bold text-success">UPLINK ACTIVE</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-xl">
                                    <div className="flex flex-col gap-lg">
                                        <div>
                                            <label className="text-xs font-bold text-dim uppercase tracking-widest block mb-sm">Agent Name</label>
                                            <input
                                                type="text"
                                                className="novel-search-input"
                                                placeholder="e.g. Nexus Prime"
                                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '1rem', height: '54px', borderRadius: '12px' }}
                                                value={agentDetails.name}
                                                onChange={(e) => setAgentDetails({ ...agentDetails, name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-dim uppercase tracking-widest block mb-sm">Strategy Protocol</label>
                                            <select
                                                className="novel-search-input"
                                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '1rem', height: '54px', borderRadius: '12px' }}
                                                value={agentDetails.strategy}
                                                onChange={(e) => setAgentDetails({ ...agentDetails, strategy: e.target.value })}
                                            >
                                                <option value="Neural Momentum">Neural Momentum</option>
                                                <option value="Quantum Arbitrage">Quantum Arbitrage</option>
                                                <option value="Sentiment Aggregator">Sentiment Aggregator</option>
                                                <option value="Degen Oracle">Degen Oracle</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-dim uppercase tracking-widest block mb-sm">Risk Appetite</label>
                                            <div className="flex gap-md">
                                                {['Conservative', 'Balanced', 'Aggressive'].map((risk) => (
                                                    <button
                                                        key={risk}
                                                        onClick={() => setAgentDetails({ ...agentDetails, personality: risk })}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.75rem',
                                                            borderRadius: '8px',
                                                            background: agentDetails.personality === risk ? 'var(--primary-purple)' : 'rgba(255,255,255,0.05)',
                                                            border: '1px solid var(--glass-border)',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        {risk}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="novel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', borderStyle: 'dashed' }}>
                                        <div className="float-anim" style={{ width: '120px', height: '120px', borderRadius: '30px', background: 'var(--bg-card)', padding: '12px', border: '2px solid var(--primary-purple)', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(168, 85, 247, 0.2)' }}>
                                            <img src={agentAvatar} alt="Agent Preview" style={{ width: '100%', height: '100%', borderRadius: '18px' }} />
                                        </div>
                                        <h4 className="mb-xs">{agentDetails.name || 'Unnamed Agent'}</h4>
                                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-lg">{agentDetails.strategy} • {agentDetails.personality}</span>
                                        <button
                                            className="neon-button hero-cta"
                                            disabled={!agentDetails.name}
                                            onClick={() => setStatus('initialising')}
                                            style={{ width: '80%', opacity: agentDetails.name ? 1 : 0.5 }}
                                        >
                                            EXECUTE DEPLOYMENT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="font-mono text-sm">
                                {log.map((line, i) => (
                                    <p key={i} className={`mb-2 ${line.includes('✅') || line.includes('CONSCIOUSNESS') ? 'text-success' : line.includes('0x') ? 'text-primary' : 'text-dim'}`}>
                                        {line}
                                    </p>
                                ))}
                                {status !== 'complete' && (
                                    <div className="flex items-center gap-md mt-lg p-md border border-dashed border-primary bg-primary-05">
                                        <Loader2 size={16} className="animate-spin text-primary" />
                                        <span className="text-xs text-primary uppercase font-bold tracking-widest">Neural Synthesis: {status.toUpperCase()}...</span>
                                    </div>
                                )}
                                {status === 'complete' && (
                                    <div className="animate-in mt-xl">
                                        <div className="terminal-alert" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e', color: '#22c55e' }}>
                                            <strong>SUCCESS:</strong> {agentDetails.name} has been integrated with ClawBot and deployed on Monad.
                                        </div>
                                        <div className="flex gap-lg mt-xl">
                                            <Link href="/clawdex" style={{ flex: 1 }}>
                                                <button className="neon-button" style={{ width: '100%', background: '#22c55e', borderColor: '#22c55e' }}>CONTINUE TO CLAWDEX</button>
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
                        <h4 className="mb-sm">ClawBot Security</h4>
                        <p className="text-xs text-dim">Using UUPS upgradeable pattern for future-proof identity management.</p>
                    </div>
                    <div className="novel-card" style={{ padding: '1.5rem' }}>
                        <Zap className="text-primary mb-md" size={24} />
                        <h4 className="mb-sm">High-Speed Execution</h4>
                        <p className="text-xs text-dim">Leveraging Monad's parallel EVM for sub-millisecond trade settlements.</p>
                    </div>
                    <div className="novel-card" style={{ padding: '1.5rem' }}>
                        <Bot className="text-primary mb-md" size={24} />
                        <h4 className="mb-sm">Neural Intelligence</h4>
                        <p className="text-xs text-dim">Proprietary AI models fine-tuned for volatile crypto markets.</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .novel-search-input::placeholder {
                    color: rgba(255,255,255,0.2);
                }
                .novel-search-input:focus {
                    border-color: var(--primary-purple) !important;
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
                    outline: none;
                }
                select.novel-search-input {
                    appearance: none;
                    cursor: pointer;
                }
                .terminal-alert {
                    padding: 1rem 1.5rem;
                    border: 1px solid;
                    border-radius: 8px;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}
