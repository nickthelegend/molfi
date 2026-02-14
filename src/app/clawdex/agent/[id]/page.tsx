"use client";

import { useState, useEffect, use } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
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
    Percent,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TradingViewChart from '@/components/TradingViewChart';
import AgentPerformanceChart from '@/components/AgentPerformanceChart';
import { MOCK_AGENTS, AIAgent } from '@/lib/agents';
import MolfiAgentVaultABI from '@/abis/MolfiAgentVault.json';

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`;

const USDC_ABI = [
    { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
] as const;

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
    const [agent, setAgent] = useState<any | null>(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const { isConnected, address } = useAccount();

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await fetch(`/api/agents/${id}`);
                const data = await res.json();
                if (data.success) {
                    setAgent(data.agent);
                } else {
                    // Fallback to mock if not found during dev
                    const mock = MOCK_AGENTS.find(a => a.id === id);
                    if (mock) setAgent(mock);
                }
            } catch (err) {
                console.error("Failed to fetch agent:", err);
                const mock = MOCK_AGENTS.find(a => a.id === id);
                if (mock) setAgent(mock);
            } finally {
                setLoading(false);
            }
        };
        fetchAgent();
    }, [id]);

    const [step, setStep] = useState<'idle' | 'approving' | 'waiting_approve' | 'depositing' | 'waiting_deposit' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
    const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | undefined>();

    // 1. Fetch USDC Balance
    const { data: usdcBalanceData } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    const formattedBalance = usdcBalanceData ? formatEther(usdcBalanceData) : "0.00";

    // 2. Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "allowance",
        args: address && agent?.vaultAddress ? [address, agent.vaultAddress as `0x${string}`] : undefined,
    });

    const { writeContractAsync } = useWriteContract();

    // 3. Wait for approve tx confirmation
    const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
        hash: approveTxHash,
    });

    // 4. Wait for deposit tx confirmation
    const { isSuccess: depositConfirmed } = useWaitForTransactionReceipt({
        hash: depositTxHash,
    });

    // When approve is confirmed, proceed to deposit
    useEffect(() => {
        if (approveConfirmed && step === 'waiting_approve') {
            refetchAllowance();
            executeDeposit();
        }
    }, [approveConfirmed]);

    // When deposit is confirmed, show success
    useEffect(() => {
        if (depositConfirmed && step === 'waiting_deposit') {
            setStep('success');
            setStakeAmount('');
            setTimeout(() => setStep('idle'), 3000);
        }
    }, [depositConfirmed]);

    if (loading) return (
        <div className="container pt-xxl text-center">
            <div className="neural-loading-orb mx-auto mb-lg" />
            <p className="text-secondary font-mono text-sm animate-pulse">Establishing Neural Link with ${id}...</p>
        </div>
    );

    if (!agent) return (
        <div className="container pt-xxl text-center">
            <h1 className="text-error">Agent Out of Range</h1>
            <Link href="/clawdex" className="text-primary underline">Back to Registry</Link>
        </div>
    );

    async function executeDeposit() {
        if (!stakeAmount || !address || !agent?.vaultAddress) return;

        setStep('depositing');
        setErrorMsg(null);

        try {
            const parsedAmount = parseEther(stakeAmount);
            const hash = await writeContractAsync({
                address: agent.vaultAddress as `0x${string}`,
                abi: MolfiAgentVaultABI,
                functionName: "deposit",
                args: [parsedAmount, address],
            });

            setDepositTxHash(hash);
            setStep('waiting_deposit');
        } catch (err: any) {
            console.error("Deposit failed:", err);
            setErrorMsg(err.shortMessage || err.message || "Deposit failed");
            setStep('error');
        }
    };

    async function handleStake() {
        if (!isConnected) {
            alert("Please connect your wallet to stake.");
            return;
        }
        if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
            alert("Please enter a valid amount to stake.");
            return;
        }

        if (!agent?.vaultAddress) {
            alert("This agent does not have a vault deployed yet.");
            return;
        }

        setStep('approving');
        setErrorMsg(null);

        try {
            const parsedAmount = parseEther(stakeAmount);

            // Check if approval is needed
            if (!allowance || (allowance as bigint) < parsedAmount) {
                const hash = await writeContractAsync({
                    address: USDC_ADDRESS,
                    abi: USDC_ABI,
                    functionName: "approve",
                    args: [agent.vaultAddress as `0x${string}`, parsedAmount],
                });

                setApproveTxHash(hash);
                setStep('waiting_approve');
            } else {
                await executeDeposit();
            }
        } catch (err: any) {
            console.error("Approval failed:", err);
            setErrorMsg(err.shortMessage || err.message || "Approval failed");
            setStep('error');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />

            <div className="container pt-xl">
                {/* Navigation & Top Bar */}
                <div className="flex items-center justify-between mb-xl">
                    <Link href="/clawdex" className="glass-back-btn">
                        <ArrowLeft size={16} />
                        <span>REGISTRY</span>
                    </Link>
                    <div className="flex items-center gap-md">
                        <div className="neural-status-indicator">
                            <div className="pulse-dot" />
                            <span>NODE_CONNECTED: {agent.agentId || '001'}</span>
                        </div>
                        <ConnectButton />
                    </div>
                </div>

                <div className="premium-hero-card">
                    <div className="hero-glow" style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
                    <div className="hero-main-layout">
                        <div className="hero-center-info">
                            <div className="hero-orb mb-lg">
                                <img src={agent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`} alt={agent.name} />
                                <div className="orb-scan" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="header-name-row">
                                    <h1>{agent.name}</h1>
                                    <span className="hero-strategy-badge">{agent.strategy || 'Neural Momentum'}</span>
                                </div>
                                <div className="badges-row">
                                    <span className="hero-stat">
                                        <Bot size={14} /> CLAW_AGENT_v2
                                    </span>
                                    <span className="hero-stat">
                                        <Lock size={14} /> MULTI_SIG_VAULT
                                    </span>
                                    <span className="hero-stat">
                                        <Globe size={14} /> MONAD_NATIVE
                                    </span>
                                </div>
                                <p className="hero-description">
                                    {agent.description || `Autonomous agent optimizing for long-term alpha via ${agent.personality || 'Balanced'} execution strategies. Powered by deep-learning market analysis.`}
                                </p>
                            </div>
                        </div>

                        <div className="hero-apy-box">
                            <span className="apy-box-label">PROJECTED APY</span>
                            <h2 className="text-gradient" style={{ fontSize: '3rem' }}>{agent.apy || '28.5'}%</h2>
                            <div className="apy-box-footer">
                                <TrendingUp size={12} />
                                <span>CONSENSUS VERIFIED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="terminal-grid">
                    {/* Left: Chart & Stats */}
                    <div className="col-span-8">
                        <div className="premium-panel mb-xl">
                            <div className="panel-header">
                                <h3 className="flex items-center gap-sm">
                                    <BarChart3 size={18} className="text-primary" />
                                    PERFORMANCE ANALYSIS
                                </h3>
                                <div className="panel-actions">
                                    <span className="time-tag active">ALL</span>
                                </div>
                            </div>
                            <div className="panel-body">
                                <AgentPerformanceChart data={agent.equityCurve || []} height={450} />
                            </div>
                        </div>

                        {/* Recent Positions Table */}
                        <div className="premium-panel">
                            <div className="panel-header">
                                <h3>ACTIVE CIRCUITS (POSITIONS)</h3>
                            </div>
                            <div className="panel-body no-padding">
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th>ASSET</th>
                                                <th>SIDE</th>
                                                <th>LEVERAGE</th>
                                                <th>SIZE</th>
                                                <th>PnL (UNREALIZED)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {agent.activePositions?.map((pos: any) => (
                                                <tr key={pos.id}>
                                                    <td className="font-bold">{pos.pair}</td>
                                                    <td>
                                                        <span className={`side-tag ${pos.side}`}>
                                                            {pos.side}
                                                        </span>
                                                    </td>
                                                    <td className="font-mono">10x</td>
                                                    <td className="font-mono">${pos.size.toLocaleString()}</td>
                                                    <td>
                                                        <div className={`pnl-display ${(pos.unrealizedPnl || 0) >= 0 ? 'plus' : 'minus'}`}>
                                                            {(pos.unrealizedPnl || 0) >= 0 ? '+' : ''}${pos.unrealizedPnl || '0.00'} ({(pos.unrealizedPnlPercent || 0).toFixed(2)}%)
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!agent.activePositions || agent.activePositions.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="empty-state">
                                                        No active positions. Monitoring for next high-precision entry.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Verified Decisions & Staking */}
                    <div className="col-span-4 flex flex-col gap-xl">
                        {/* Staking Panel */}
                        <div className="allocation-panel">
                            <div className="flex justify-between items-center mb-xl">
                                <h3 className="m-0 flex items-center gap-sm text-[12px] font-bold tracking-wider">
                                    <Percent size={14} className="text-primary" />
                                    ALLOCATE CAPITAL
                                </h3>
                                <div className="text-[10px] text-dim font-mono">
                                    NODE: {agent.agentId || '001'}
                                </div>
                            </div>

                            <div className="mb-xl">
                                <div className="flex justify-between mb-xs">
                                    <label className="text-[9px] font-bold text-dim uppercase">Amount (USDT)</label>
                                    <span className="text-[9px] text-primary cursor-pointer hover:underline" onClick={() => setStakeAmount(formattedBalance)}>BAL: {parseFloat(formattedBalance).toLocaleString()}</span>
                                </div>
                                <div className="allocation-input-wrap">
                                    <span className="currency-prefix text-xs">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="allocation-input"
                                        style={{ fontSize: '1rem' }}
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        disabled={step !== 'idle'}
                                    />
                                    <button className="max-btn" onClick={() => setStakeAmount(formattedBalance)} disabled={step !== 'idle'}>MAX</button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-xs mb-xl pb-md border-b border-white/5">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-dim/60">Execution Fee</span>
                                    <span className="text-primary-purple font-bold">0.05%</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-dim/60">Strategy Lock</span>
                                    <span className="font-bold">Neutral Only</span>
                                </div>
                            </div>

                            {agent.vaultAddress ? (
                                <>
                                    <button
                                        className={`allocate-btn ${step !== 'idle' && step !== 'success' && step !== 'error' ? 'loading' : ''}`}
                                        onClick={handleStake}
                                        disabled={step !== 'idle' && step !== 'success' && step !== 'error'}
                                    >
                                        {step === 'idle' && "Allocate capitall.."}
                                        {step === 'approving' && "APPROVE IN WALLET..."}
                                        {step === 'waiting_approve' && "CONFIRMING APPROVAL..."}
                                        {step === 'depositing' && "DEPOSIT IN WALLET..."}
                                        {step === 'waiting_deposit' && "CONFIRMING DEPOSIT..."}
                                        {step === 'success' && "SUCCESS! RELAY ACTIVE"}
                                        {step === 'error' && "FAILED - RETRY?"}
                                    </button>
                                    {errorMsg && (
                                        <div className="mt-sm p-sm bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400 font-mono">
                                            ERROR: {errorMsg}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-md bg-purple-500/5 border border-purple-500/20 rounded-xl text-center">
                                    <div className="text-[10px] text-primary-purple font-bold uppercase tracking-widest mb-xs">Vault Status</div>
                                    <div className="text-[11px] text-dim">Neural vault pending initialization.</div>
                                </div>
                            )}
                        </div>

                        {/* Decision Timeline */}
                        <div className="premium-panel">
                            <div className="panel-header">
                                <h3 className="flex items-center gap-sm">
                                    <ShieldCheck size={18} className="text-primary" />
                                    SIGNAL ARCHIVE
                                </h3>
                            </div>
                            <div className="panel-body">
                                <div className="neural-timeline">
                                    {agent.recentDecisions?.map((dec: any, i: number) => (
                                        <div key={dec.id || i} className="timeline-step">
                                            <div className="step-marker" />
                                            <div className="step-box">
                                                <div className="flex items-center justify-between mb-xs">
                                                    <span className={`step-action ${dec.isLong || dec.action === 'BUY' ? 'long' : 'short'}`}>
                                                        {dec.isLong || dec.action === 'BUY' ? 'BUY / LONG' : 'SELL / SHORT'}
                                                    </span>
                                                    <span className="step-time">
                                                        {dec.createdAt ? new Date(dec.createdAt).toLocaleTimeString() : 'RECENT'}
                                                    </span>
                                                </div>
                                                <p className="step-pair">{dec.pair}</p>
                                                <div className="step-sig">
                                                    <div className="sig-hash">AUTH_ID: {dec.id?.slice(0, 12) || dec.proof}</div>
                                                    <Activity size={10} className="text-dim/50" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .glass-back-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    transition: all 0.2s;
                }
                .glass-back-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--primary-purple); }

                .neural-status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: rgba(168, 85, 247, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 99px;
                    border: 1px solid rgba(168, 85, 247, 0.2);
                }
                .neural-status-indicator span { font-size: 10px; font-weight: 800; font-family: var(--font-mono); color: var(--primary-purple); }

                .premium-hero-card {
                    background: linear-gradient(135deg, rgba(16, 16, 24, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    border-radius: 32px;
                    padding: 3rem;
                    margin-bottom: 3rem;
                    position: relative;
                    overflow: hidden;
                }
                .hero-orb { position: relative; width: 140px; height: 140px; }
                .hero-orb img { width: 100%; height: 100%; border-radius: 32px; object-fit: cover; border: 2px solid rgba(168, 85, 247, 0.3); }
                .orb-scan {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: var(--primary-purple);
                    box-shadow: 0 0 15px var(--primary-purple);
                    animation: scan 3s ease-in-out infinite;
                }
                @keyframes scan { 0%, 100% { top: 0%; } 50% { top: 100%; } }

                .hero-strategy-badge {
                    font-size: 10px;
                    font-weight: 800;
                    background: rgba(168, 85, 247, 0.15);
                    color: var(--primary-purple);
                    padding: 0.3rem 0.8rem;
                    border-radius: 8px;
                    letter-spacing: 0.1em;
                }

                .hero-main-layout {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3rem;
                    position: relative;
                    z-index: 10;
                }

                .hero-center-info {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    flex: 1;
                }

                .header-name-row {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .header-name-row h1 {
                    font-size: 3.5rem;
                    letter-spacing: -0.04em;
                    margin: 0;
                }

                .badges-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .hero-stat { display: flex; align-items: center; gap: 0.5rem; font-size: 11px; font-weight: 700; color: var(--text-dim); }
                .hero-description { font-size: 1rem; color: var(--text-secondary); line-height: 1.6; max-width: 700px; margin: 0 auto; }

                @media (min-width: 1024px) {
                    .hero-main-layout {
                        flex-direction: row;
                        justify-content: center;
                        min-height: 200px;
                    }
                    .hero-apy-box {
                        position: absolute;
                        right: 0;
                        top: 50%;
                        transform: translateY(-50%);
                    }
                }

                .hero-apy-box {
                    background: rgba(168, 85, 247, 0.05);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    padding: 2rem;
                    border-radius: 24px;
                    text-align: center;
                    min-width: 240px;
                }
                .apy-box-label { font-size: 10px; font-weight: 800; color: var(--text-dim); letter-spacing: 0.2em; display: block; margin-bottom: 0.5rem; }
                .apy-box-footer { display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: #10b981; font-size: 9px; font-weight: 800; margin-top: 1rem; }

                .premium-panel {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    overflow: hidden;
                }
                .panel-header { padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; }
                .panel-header h3 { font-size: 0.9rem; font-weight: 800; letter-spacing: 0.1em; }
                .time-tag { font-size: 10px; font-weight: 700; color: var(--text-dim); padding: 0.3rem 0.6rem; cursor: pointer; border-radius: 6px; }
                .time-tag.active { background: var(--primary-purple); color: white; }

                .premium-table { width: 100%; border-collapse: collapse; }
                .premium-table th { text-align: left; padding: 1.25rem; font-size: 10px; color: var(--text-dim); letter-spacing: 0.1em; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .premium-table td { padding: 1.25rem; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
                .side-tag { font-size: 8px; font-weight: 900; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
                .side-tag.long { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .side-tag.short { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .pnl-display { font-weight: 800; font-family: var(--font-mono); }
                .pnl-display.plus { color: #10b981; }
                .pnl-display.minus { color: #ef4444; }

                .allocation-panel {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    border-radius: 20px;
                    padding: 1.5rem;
                }
                .allocation-input-wrap {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0.75rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .currency-prefix { font-weight: 800; color: var(--primary-purple); }
                .allocation-input { background: transparent; border: none; color: white; font-weight: 700; font-size: 1.25rem; width: 100%; outline: none; }
                .max-btn { background: rgba(168, 85, 247, 0.2); color: var(--primary-purple); border: none; font-size: 10px; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }

                .allocate-btn {
                    width: 100%;
                    background: var(--primary-purple);
                    color: white;
                    border: none;
                    height: 48px;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .allocate-btn:hover { background: var(--secondary-purple); transform: translateY(-1px); }

                .neural-timeline { position: relative; padding-left: 24px; }
                .neural-timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: rgba(168, 85, 247, 0.2); }
                .timeline-step { position: relative; margin-bottom: 2rem; }
                .step-marker { position: absolute; left: -28px; top: 0; width: 7px; height: 7px; border-radius: 100%; background: var(--primary-purple); box-shadow: 0 0 10px var(--primary-purple); }
                .step-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.03); border-radius: 12px; padding: 1rem; }
                .step-action { font-size: 8px; font-weight: 900; }
                .step-action.long { color: #10b981; }
                .step-action.short { color: #ef4444; }
                .step-time { font-size: 8px; color: var(--text-dim); }
                .step-pair { font-size: 0.9rem; font-weight: 800; color: white; margin-top: 0.25rem; }
                .step-sig { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
                .sig-hash { font-size: 8px; color: var(--text-dim); font-family: var(--font-mono); }

                .neural-loading-orb {
                    width: 60px; height: 60px;
                    border: 3px solid rgba(168, 85, 247, 0.1);
                    border-top: 3px solid var(--primary-purple);
                    border-radius: 100%;
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}
