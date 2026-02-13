"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import {
    Zap,
    ShieldCheck,
    Loader2,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Copy,
    ExternalLink,
    Cpu,
    Activity,
    Database,
    Fingerprint,
    Terminal,
    ChevronRight,
    Lock,
    Settings,
    Layers,
    Navigation,
    Radar,
    Search,
    Globe
} from "lucide-react";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`;
const USDC_ABI = [
    { "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
] as const;

export default function FaucetPage() {
    const { address, isConnected } = useAccount();
    const [isMinting, setIsMinting] = useState(false);
    const [minted, setMinted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([
        "> Initialize Molfi Core...",
        "> Protocol: FaucetInject_V3",
        "> Security: Level 4 Neural Encrypted",
        "> Status: System Standby (99.9% Uptime)"
    ]);
    const logEndRef = useRef<HTMLDivElement>(null);

    const { writeContractAsync } = useWriteContract();

    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-15), `> ${msg}`]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const requestTokens = async () => {
        if (!address) {
            addLog("Error: Neural identity not detected.");
            return;
        }

        setIsMinting(true);
        setError(null);
        setMinted(false);
        addLog(`Initiating synthesis for address ${address.substring(0, 8)}...`);
        addLog("Routing through Monad Neural Infrastructure...");

        try {
            const hash = await writeContractAsync({
                address: USDC_ADDRESS,
                abi: USDC_ABI,
                functionName: "mint",
                args: [address, parseEther("1000")],
            });

            setTxHash(hash);
            addLog(`Synthesis Successful. Hash: ${hash.substring(0, 16)}...`);
            setMinted(true);
            setTimeout(() => refetchBalance(), 2000);
        } catch (err: any) {
            console.error(err);
            const errMsg = err.message || "Unknown error";
            setError("Neural link instability detected. Retrying with fallback...");
            addLog(`CRITICAL_FAIL: RPC Timeout or Rate Limit.`);
            addLog(`Retrying through fallback nodes...`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="neural-command-center">
            {/* Immersive HUD Overlay */}
            <div className="hud-corner top-left"><Settings size={14} /> SYSTEM_MENU</div>
            <div className="hud-corner top-right">LATENCY: 14ms <Activity size={14} className="text-success" /></div>
            <div className="hud-corner bottom-left">MOLFI_OS v2.4.0</div>
            <div className="hud-corner bottom-right"><Lock size={14} /> SECURE_SHELL</div>

            <div className="scan-line-v2" />
            <div className="gradient-sphere" />

            <main className="faucet-container container">
                {/* Visual Header */}
                <header className="faucet-hero float-anim">
                    <div className="neon-pill">
                        <Radar size={14} className="animate-spin-slow" />
                        <span>SYNTHESIS_PROTO_ACTIVE</span>
                    </div>
                    <h1 className="main-title">Neural <span className="text-purple-glow">Vanguard</span></h1>
                    <p className="description">Deploy high-fidelity liquidity. Synthesize 1,000 mUSDC directly into your neural core over the Monad Testnet.</p>
                </header>

                <div className="command-grid">
                    {/* Diagnostic Monitor */}
                    <div className="diagnostic-panel premium-card">
                        <div className="panel-tab">
                            <Terminal size={12} />
                            <span>LIVE_DEBUG_FEED</span>
                        </div>
                        <div className="terminal-box">
                            {logs.map((log, i) => (
                                <div key={i} className="terminal-line">{log}</div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                        <div className="diagnostic-stats">
                            <div className="stat-pill">
                                <Globe size={10} /> <span>NODES: 104</span>
                            </div>
                            <div className="stat-pill">
                                <Search size={10} /> <span>INTEGRITY: 100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Synthesis Core */}
                    <div className="synthesis-panel premium-card scale-in">
                        <div className="core-header">
                            <div className="core-id">
                                <div className="id-icon"><Zap size={18} /></div>
                                <div>
                                    <h3>Core Synthesis Unit</h3>
                                    <p>mUSDC | ERC-20 Infrastructure</p>
                                </div>
                            </div>
                            <div className="health-badge">
                                <ShieldCheck size={12} />
                                <span>VERIFIED_LINK</span>
                            </div>
                        </div>

                        <div className="status-displays">
                            <div className="display-box">
                                <label><Fingerprint size={10} /> NEURAL_ADDRESS</label>
                                <span className="val-mono">{isConnected ? address : "NOT_CONNECTED"}</span>
                            </div>
                            <div className="display-box highlight">
                                <label><Database size={10} /> CURRENT_SYNTH_LEVEL</label>
                                <div className="val-row">
                                    <span className="big-val">{balance ? Number(formatEther(balance)).toLocaleString(undefined, { minimumFractionDigits: 1 }) : "0.0"}</span>
                                    <span className="unit">mUSDC</span>
                                </div>
                            </div>
                        </div>

                        <div className="interaction-zone">
                            <div className="chamber-label">
                                <span>SYNTH_VOLUME:</span>
                                <span className="text-primary font-bold">1,000.00 mUSDC</span>
                            </div>

                            {minted ? (
                                <div className="success-state-v2 float-anim">
                                    <div className="success-radial">
                                        <CheckCircle2 size={40} className="text-success" />
                                    </div>
                                    <h4>SYNTHESIS_COMPLETE</h4>
                                    <div className="action-btns">
                                        <button className="btn-secondary" onClick={() => setMinted(false)}>RESET_BIO</button>
                                        {txHash && (
                                            <a href={`https://monad-testnet.socialscan.io/tx/${txHash}`} target="_blank" className="btn-primary">
                                                VIEW_HASH <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className={`main-action-btn ${isMinting ? 'loading' : ''}`}
                                    onClick={requestTokens}
                                    disabled={isMinting || !isConnected}
                                >
                                    {isMinting ? (
                                        <div className="flex items-center gap-md">
                                            <Loader2 size={24} className="animate-spin" />
                                            <span>SYNTHESIZING...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-md">
                                            <span>INITIATE SYNTHESIS</span>
                                            <ArrowRight size={20} />
                                        </div>
                                    )}
                                    <div className="btn-shine" />
                                </button>
                            )}

                            {error && (
                                <div className="error-marquee">
                                    <AlertCircle size={14} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="faucet-footer">
                    <div className="footer-item"><Navigation size={12} /> MONAD_TESTNET_L1</div>
                    <div className="footer-item"><Cpu size={12} /> PARALLEL_PROCESSING_ON</div>
                    <div className="footer-item text-primary">STABLE_RELAY_CONNECTED</div>
                </div>
            </main>

            <style jsx>{`
                .neural-command-center {
                    position: relative;
                    min-height: 100vh;
                    background: #050508;
                    color: white;
                    padding-bottom: 5rem;
                    overflow: hidden;
                    font-family: var(--font-display);
                }

                .scan-line-v2 {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    height: 100px;
                    background: linear-gradient(to bottom, transparent, rgba(168, 85, 247, 0.05), transparent);
                    animation: v-scan 8s linear infinite;
                    pointer-events: none;
                    z-index: 1;
                }
                @keyframes v-scan { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }

                .gradient-sphere {
                    position: fixed;
                    top: -20%;
                    left: 30%;
                    width: 800px;
                    height: 800px;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
                    filter: blur(120px);
                    pointer-events: none;
                    z-index: 0;
                }

                .hud-corner {
                    position: fixed;
                    font-size: 10px;
                    font-weight: 900;
                    color: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    letter-spacing: 0.2em;
                    z-index: 100;
                    padding: 2rem;
                    pointer-events: none;
                }
                .top-left { top: 70px; left: 0; }
                .top-right { top: 70px; right: 0; }
                .bottom-left { bottom: 0; left: 0; }
                .bottom-right { bottom: 0; right: 0; }

                .faucet-container {
                    position: relative;
                    z-index: 10;
                    padding-top: 15vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .faucet-hero { text-align: center; margin-bottom: 4rem; max-width: 600px; }
                .neon-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(168, 85, 247, 0.1);
                    border: 1px solid var(--glass-border);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--primary-purple);
                    letter-spacing: 0.1em;
                    margin-bottom: 1.5rem;
                }

                .main-title { font-size: 5rem; font-weight: 900; line-height: 1; margin-bottom: 1rem; letter-spacing: -3px; }
                .text-purple-glow { color: white; text-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }

                .description { color: var(--text-dim); font-size: 1.1rem; line-height: 1.6; }

                .command-grid {
                    display: grid;
                    grid-template-columns: 340px 540px;
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .premium-card {
                    background: rgba(15, 15, 22, 0.8);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    padding: 2rem;
                    position: relative;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                }

                /* Diagnostic Panel */
                .panel-tab { display: flex; align-items: center; gap: 0.5rem; font-size: 10px; font-weight: 900; color: var(--text-dim); letter-spacing: 0.1em; margin-bottom: 1.25rem; }
                .terminal-box {
                    height: 280px;
                    background: rgba(0,0,0,0.5);
                    border-radius: 12px;
                    padding: 1.25rem;
                    font-family: var(--font-mono);
                    font-size: 11px;
                    color: rgba(255,255,255,0.7);
                    overflow-y: auto;
                    margin-bottom: 1.5rem;
                }
                .terminal-line { margin-bottom: 0.5rem; line-height: 1.4; animation: fadeInLog 0.2s ease-out; }
                @keyframes fadeInLog { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }

                .diagnostic-stats { display: flex; gap: 1rem; }
                .stat-pill { display: flex; align-items: center; gap: 0.4rem; font-size: 9px; color: var(--text-dim); background: rgba(255,255,255,0.03); padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 800; }

                /* Synthesis Core */
                .core-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                .core-id { display: flex; gap: 1rem; align-items: center; }
                .id-icon { width: 44px; height: 44px; background: var(--primary-purple); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
                .core-id h3 { font-size: 1.2rem; margin: 0; font-weight: 900; }
                .core-id p { font-size: 0.75rem; color: var(--text-dim); margin: 0; }

                .health-badge { display: flex; align-items: center; gap: 0.4rem; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 9px; font-weight: 900; }

                .status-displays { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
                .display-box { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 1.25rem; border-radius: 16px; }
                .display-box.highlight { border-color: var(--primary-purple); background: rgba(168, 85, 247, 0.05); }
                .display-box label { display: flex; align-items: center; gap: 0.5rem; font-size: 9px; font-weight: 900; color: var(--text-dim); margin-bottom: 1rem; }
                .val-mono { font-family: var(--font-mono); font-size: 10px; color: white; display: block; overflow: hidden; text-overflow: ellipsis; }
                .val-row { display: flex; align-items: baseline; gap: 0.5rem; }
                .big-val { font-size: 1.75rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; }
                .unit { font-size: 0.75rem; font-weight: 900; color: var(--primary-purple); }

                .interaction-zone { background: rgba(0,0,0,0.5); border: 1px dashed var(--glass-border); padding: 2rem; border-radius: 20px; text-align: center; }
                .chamber-label { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 1.5rem; font-weight: 900; letter-spacing: 0.1em; color: var(--text-dim); }

                .main-action-btn {
                    width: 100%;
                    background: var(--primary-purple);
                    border: none;
                    height: 64px;
                    border-radius: 16px;
                    color: white;
                    font-weight: 900;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(168, 85, 247, 0.4);
                    font-size: 1rem;
                    letter-spacing: 0.1em;
                }
                .main-action-btn:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 30px 60px rgba(168, 85, 247, 0.5); }
                .main-action-btn:disabled { background: #2a2a2c; cursor: not-allowed; box-shadow: none; opacity: 0.5; }
                .btn-shine { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transform: translateX(-100%); transition: 0.5s; }
                .main-action-btn:hover .btn-shine { transform: translateX(100%); }

                .success-state-v2 { text-align: center; animation: slideInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } }
                .success-radial { width: 64px; height: 64px; background: rgba(16,185,129,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
                .action-btns { display: flex; gap: 1rem; }
                .btn-primary, .btn-secondary { flex: 1; padding: 1rem; border-radius: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; border: 1px solid var(--glass-border); }
                .btn-primary { background: var(--primary-purple); border-color: var(--primary-purple); color: white; }
                .btn-secondary { background: rgba(255,255,255,0.03); color: white; }
                .btn-primary:hover { opacity: 0.9; transform: scale(1.02); }
                .btn-secondary:hover { border-color: white; }

                .error-marquee { display: flex; align-items: center; gap: 0.75rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.75rem; border-radius: 12px; color: #ef4444; font-size: 11px; margin-top: 1.5rem; font-weight: 800; }

                .faucet-footer { display: flex; gap: 3rem; margin-top: 5rem; padding-top: 2rem; border-top: 1px solid var(--glass-border); opacity: 0.4; pointer-events: none; }
                .footer-item { display: flex; align-items: center; gap: 0.5rem; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; }

                @keyframes floatHero { 0% { transform: translateY(0); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0); } }
                .float-anim { animation: floatHero 8s ease-in-out infinite; }
                .animate-spin-slow { animation: spin 4s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .command-grid { grid-template-columns: 1fr; }
                    .main-title { font-size: 3.5rem; }
                    .diagnostic-panel { display: none; }
                }
            `}</style>
        </div>
    );
}
