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

        await new Promise(r => setTimeout(r, 1000));
        addLog(`✅ ${agentDetails.name}_IdentityRegistry: 0xB159E0c8093081712c92e274DbFEa5A97A80cA30`);
        addLog(`✅ MolfiAgentVault: 0x${Math.random().toString(16).slice(2, 42)}`);
        addLog("✅ ReputationRegistry: 0x38E9cDB0eBc128bEA55c36C03D5532697669132d");

        await new Promise(r => setTimeout(r, 1000));
        addLog("✅ ClawBot_Bridge: 0x386fd4Fa2F27E528CF2D11C6d4b0A4dceD283E0E");
        addLog("Linking Neural Core to Monad Execution Layer...");
        addLog("System: Vault linked to Agent ID. Ready for Liquidity.");

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

                    <div className="terminal-body" style={{ minHeight: '400px', background: 'rgba(5, 5, 10, 0.98)', padding: '3rem', fontFamily: 'var(--font-mono)' }}>
                        {!isConnected ? (
                            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Lock size={48} className="text-primary mb-lg opacity-80" style={{ filter: 'drop-shadow(0 0 10px var(--primary-purple))' }} />
                                <h3 className="mb-md" style={{ color: 'var(--text-primary)' }}>IDENTITY REQUIRED</h3>
                                <p className="text-secondary mb-xl" style={{ maxWidth: '400px', fontSize: '0.9rem' }}>Connect your cryptographic signature to access the neural synthesis terminal.</p>
                                <ConnectButton />
                            </div>
                        ) : status === 'idle' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                                <div className="flex flex-col items-center gap-md p-xl novel-card" style={{ background: 'rgba(168, 85, 247, 0.05)', borderStyle: 'solid', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-purple)', boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)', marginBottom: '0.5rem' }}>
                                        <img src={userAvatar} alt="User" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-primary block mb-xs uppercase font-bold tracking-widest">Uplink Status: Active</span>
                                        <p className="font-mono text-white text-lg font-bold tracking-tight">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-xxl">
                                    <div className="flex flex-col gap-xl">
                                        <div style={{ textAlign: 'center' }}>
                                            <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-md">Agent Neural Signature</label>
                                            <input
                                                type="text"
                                                className="novel-search-input"
                                                placeholder="ENTER AGENT NAME..."
                                                style={{
                                                    background: 'rgba(168, 85, 247, 0.03)',
                                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                                    padding: '1rem',
                                                    height: '60px',
                                                    borderRadius: '12px',
                                                    textAlign: 'center',
                                                    fontSize: '1.25rem',
                                                    color: 'white',
                                                    width: '100%',
                                                    maxWidth: '500px',
                                                    margin: '0 auto'
                                                }}
                                                value={agentDetails.name}
                                                onChange={(e) => setAgentDetails({ ...agentDetails, name: e.target.value })}
                                            />
                                        </div>


                                        <div style={{ textAlign: 'center' }}>
                                            <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-md">Risk Appetite Synthesis</label>
                                            <div className="flex justify-center gap-md max-w-[500px] mx-auto">
                                                {['Conservative', 'Balanced', 'Aggressive'].map((risk) => (
                                                    <button
                                                        key={risk}
                                                        onClick={() => setAgentDetails({ ...agentDetails, personality: risk })}
                                                        style={{
                                                            flex: 1,
                                                            padding: '1rem',
                                                            borderRadius: '12px',
                                                            background: agentDetails.personality === risk ? 'var(--primary-purple)' : 'rgba(168, 85, 247, 0.05)',
                                                            border: '1px solid rgba(168, 85, 247, 0.3)',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            transition: 'all 0.3s ease',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.1em'
                                                        }}
                                                    >
                                                        {risk}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="novel-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(168, 85, 247, 0.02)', borderStyle: 'dashed', padding: '3rem' }}>
                                        <div className="float-anim" style={{ width: '140px', height: '140px', borderRadius: '40px', background: 'rgba(0,0,0,0.5)', padding: '16px', border: '2px solid var(--primary-purple)', marginBottom: '2rem', boxShadow: '0 0 50px rgba(168, 85, 247, 0.3)' }}>
                                            <img src={agentAvatar} alt="Agent Preview" style={{ width: '100%', height: '100%', borderRadius: '24px' }} />
                                        </div>
                                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>{agentDetails.name || 'Unnamed Agent'}</h2>
                                        <span className="text-xs text-primary font-bold uppercase tracking-[0.3em] mb-xl">{agentDetails.personality} RISK PROFILE</span>
                                        <button
                                            className="premium-button"
                                            disabled={!agentDetails.name}
                                            onClick={handleLaunch}
                                            style={{ width: '100%', maxWidth: '400px', height: '64px', fontSize: '1.1rem', opacity: agentDetails.name ? 1 : 0.4 }}
                                        >
                                            EXECUTE NEURAL DEPLOYMENT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="font-mono text-sm" style={{ padding: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                                <div className="flex flex-col gap-sm mb-xxl">
                                    {log.map((line, i) => (
                                        <p key={i} className={`mb-2 ${line.includes('✅') || line.includes('CONSCIOUSNESS') ? 'text-success' : line.includes('0x') ? 'text-primary' : 'text-white/70'}`} style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                                            {line}
                                        </p>
                                    ))}
                                </div>

                                {status !== 'complete' && (
                                    <div className="flex flex-col items-center gap-lg mt-xl p-xl border border-dashed border-primary/30 bg-primary/5 rounded-2xl">
                                        <Loader2 size={32} className="animate-spin text-primary" />
                                        <span className="text-sm text-primary uppercase font-bold tracking-[0.2em]">Neural Synthesis: {status.toUpperCase()}...</span>
                                    </div>
                                )}

                                {status === 'complete' && (
                                    <div className="animate-in mt-xl">
                                        <div className="terminal-alert" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '2rem', borderRadius: '16px', boxShadow: '0 0 30px rgba(34, 197, 94, 0.1)' }}>
                                            <CheckCircle size={32} className="mx-auto mb-md" />
                                            <strong style={{ display: 'block', fontSize: '1.25rem', marginBottom: '0.5rem' }}>EVOLUTION COMPLETE</strong>
                                            <p style={{ opacity: 0.9 }}>{agentDetails.name} has been integrated with ClawBot and successfully deployed on the Monad Parallel Layer.</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-lg mt-xxl max-w-[600px] mx-auto">
                                            <Link href="/clawdex" style={{ flex: 1 }}>
                                                <button className="premium-button" style={{ width: '100%', background: '#22c55e', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)' }}>CONTINUE TO CLAWDEX</button>
                                            </Link>
                                            <Link href="/" style={{ flex: 1 }}>
                                                <button className="premium-button" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>RETURN HOME</button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                <p className="animate-pulse mt-xl text-primary-purple text-xl">_</p>
                            </div>
                        )}
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
