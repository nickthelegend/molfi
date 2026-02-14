
"use client";

import { use, useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatEther, parseEther, decodeEventLog } from 'viem';
import { ArrowLeft, ExternalLink, TrendingUp, Wallet, AlertCircle, RefreshCw, DollarSign, Lock, BarChart3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MolfiAgentVaultABI from '@/abis/MolfiAgentVault.json';
import { shortenAddress, getExplorerUrl } from '@/lib/contract-helpers';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function InvestmentDetailsPage({ params }: { params: Promise<{ txHash: string }> }) {
    const { txHash } = use(params);
    const { address, isConnected } = useAccount();
    const [investment, setInvestment] = useState<any>(null);
    const [agentData, setAgentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentValue, setCurrentValue] = useState<string>('0');
    const [pnl, setPnl] = useState<string>('0');
    const [pnlPercentage, setPnlPercentage] = useState<string>('0');
    const [withdrawMode, setWithdrawMode] = useState<'profit' | 'all' | null>(null);
    const [fallbackAmount, setFallbackAmount] = useState<string>('0');
    const [fallbackShares, setFallbackShares] = useState<string>('0');

    // Wagmi hooks for withdrawal
    const { writeContractAsync, isPending: isWithdrawing } = useWriteContract();
    const publicClient = usePublicClient();
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<string>('');
    const [hasAutoScanned, setHasAutoScanned] = useState(false);
    const searchParams = useSearchParams();

    // Check for withdraw action in URL
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'withdraw') {
            setWithdrawMode('all');
        }
    }, [searchParams]);

    // Auto-recovery effect
    useEffect(() => {
        if (!loading && !investment && !isScanning && !scanError && !hasAutoScanned) {
            setHasAutoScanned(true);
            handleScan();
        }
    }, [loading, investment, isScanning, scanError, hasAutoScanned]);

    const handleScan = async () => {
        setIsScanning(true);
        setScanError(null);
        setScanStatus("Initializing blockchain scan...");

        try {
            if (!publicClient) throw new Error("Network connection failed. Please connect your wallet.");

            // 1. Get Tx Receipt
            setScanStatus(`Searching for transaction: ${shortenAddress(txHash)}...`);
            const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

            if (!receipt) {
                // Determine if we should wait/retry? (Simple logic for now)
                throw new Error("Transaction not found on this chain. Check your network.");
            }

            // 2. Fetch All Agents to get Vault Addresses
            setScanStatus("Fetching agent protocols...");
            const agentsRes = await fetch('/api/agents');
            const agentsData = await agentsRes.json();
            const agents = agentsData.agents || [];

            // 3. Check for Vault interaction
            setScanStatus("Analyzing transaction logs...");
            let foundAgent = null;
            let mintedShares = '0';
            let amount = '0';

            for (const agent of agents) {
                if (agent.vaultAddress) {
                    const vaultLog = receipt.logs.find(l => l.address.toLowerCase() === agent.vaultAddress.toLowerCase());
                    if (vaultLog) {
                        foundAgent = agent;
                        try {
                            const event = decodeEventLog({
                                abi: MolfiAgentVaultABI,
                                data: vaultLog.data,
                                topics: vaultLog.topics,
                            });
                            if (event.eventName === 'Deposit') {
                                mintedShares = formatEther((event.args as any).shares);
                                amount = formatEther((event.args as any).assets);
                            }
                        } catch (e) {
                            // ignore
                        }
                        break;
                    }
                }
            }

            if (foundAgent) {
                setScanStatus(`Identified Investment in ${foundAgent.name}. Syncing...`);

                // 4. Register Investment
                const createRes = await fetch('/api/investments/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        txHash: txHash,
                        agentId: foundAgent.agentId,
                        userAddress: address || receipt.from,
                        amount: amount !== '0' ? amount : '0',
                        shares: mintedShares !== '0' ? mintedShares : amount
                    })
                });

                if (!createRes.ok) {
                    const errorData = await createRes.json();
                    throw new Error(errorData.error || "Database sync failed.");
                }

                setScanStatus("Restoration complete.");

                // Update local state instead of reloading
                await fetchInvestment(true);
                setIsScanning(false);
            } else {
                throw new Error("Transaction is valid but did not interact with any known Molfi Agent.");
            }

        } catch (err: any) {
            console.error("Scan failed:", err);
            setScanError(err.message || "Scan failed.");
            setScanStatus("");
            setIsScanning(false);
        }
    };

    const fetchInvestment = async (silently = false) => {
        if (!silently) setLoading(true);
        try {
            const res = await fetch(`/api/investments/${txHash}`);
            const data = await res.json();
            if (data.success) {
                setInvestment(data.investment);
                // Fetch agent details for "Agent Archi" (Architecture/Stats)
                if (data.investment.agents?.agentId) {
                    fetchAgentDetails(data.investment.agents.agentId);
                }
            }
        } catch (error) {
            console.error('Failed to fetch investment:', error);
        } finally {
            if (!silently) setLoading(false);
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (txHash) fetchInvestment();
    }, [txHash]);

    useEffect(() => {
        if (!investment || !publicClient) return;
        if (!investment.agents?.vault_address) return;

        const hasDbAmount = parseFloat(investment.amount || '0') > 0;
        const hasDbShares = parseFloat(investment.shares || '0') > 0;
        if (hasDbAmount && hasDbShares) return;

        const hydrateFromReceipt = async () => {
            try {
                const receipt = await publicClient.getTransactionReceipt({ hash: investment.tx_hash as `0x${string}` });
                const vaultLog = receipt.logs.find(
                    (l) => l.address.toLowerCase() === investment.agents.vault_address.toLowerCase()
                );
                if (!vaultLog) return;
                const event = decodeEventLog({
                    abi: MolfiAgentVaultABI,
                    data: vaultLog.data,
                    topics: vaultLog.topics,
                });
                if (event.eventName === 'Deposit') {
                    const assets = formatEther((event.args as any).assets);
                    const shares = formatEther((event.args as any).shares);
                    setFallbackAmount(assets);
                    setFallbackShares(shares);
                }
            } catch (err) {
                console.error("Failed to hydrate investment from receipt:", err);
            }
        };

        hydrateFromReceipt();
    }, [investment, publicClient]);

    const fetchAgentDetails = async (agentId: string) => {
        try {
            const res = await fetch(`/api/agents/${agentId}`);
            const data = await res.json();
            if (data.success) {
                setAgentData(data.agent);
            }
        } catch (error) {
            console.error("Failed to fetch agent details:", error);
        }
    }

    // Read current share value (User's Position Value)
    const { data: shareValue } = useReadContract({
        address: investment?.agents?.vault_address as `0x${string}`,
        abi: MolfiAgentVaultABI,
        functionName: 'previewRedeem',
        args: [
            investment
                ? parseEther(
                    (parseFloat(investment.shares || '0') > 0
                        ? investment.shares
                        : fallbackShares
                    ).toString()
                )
                : 0n
        ],
        query: {
            enabled: !!investment?.agents?.vault_address && (parseFloat(investment?.shares || '0') > 0 || parseFloat(fallbackShares || '0') > 0),
        }
    });

    // Update PnL when share value is fetched
    useEffect(() => {
        if (shareValue && investment) {
            const currentVal = formatEther(shareValue as bigint);
            setCurrentValue(currentVal);

            const initialAmount = parseFloat(investment.amount || '0') > 0
                ? parseFloat(investment.amount)
                : parseFloat(fallbackAmount || '0');
            const currentAmount = parseFloat(currentVal);
            const pnlValue = currentAmount - initialAmount;

            setPnl(pnlValue.toFixed(4));
            setPnlPercentage(initialAmount > 0 ? ((pnlValue / initialAmount) * 100).toFixed(2) : "0.00");
        }
    }, [shareValue, investment]);

    const handleWithdraw = async (mode: 'profit' | 'all') => {
        if (!investment?.agents?.vault_address) return;
        setWithdrawMode(mode);

        try {
            let tx;
            const sharesToUse = parseFloat(investment.shares || '0') > 0
                ? investment.shares
                : fallbackShares;

            if (mode === 'all') {
                // Redeem full shares
                tx = await writeContractAsync({
                    address: investment.agents.vault_address as `0x${string}`,
                    abi: MolfiAgentVaultABI,
                    functionName: 'redeem',
                    args: [
                        parseEther(sharesToUse.toString()),
                        address,
                        address
                    ],
                });
            } else {
                // Withdraw Profit Only
                // Profit = Current Value - Initial Investment
                const initialAmount = parseFloat(investment.amount || '0') > 0
                    ? parseFloat(investment.amount)
                    : parseFloat(fallbackAmount || '0');
                const currentVal = parseFloat(currentValue);
                const profit = currentVal - initialAmount;

                if (profit <= 0) {
                    alert("No profit to withdraw.");
                    setWithdrawMode(null);
                    return;
                }

                tx = await writeContractAsync({
                    address: investment.agents.vault_address as `0x${string}`,
                    abi: MolfiAgentVaultABI,
                    functionName: 'withdraw',
                    args: [
                        parseEther(profit.toFixed(18)), // precision handling
                        address,
                        address
                    ],
                });
            }
            console.log("Withdrawal TX:", tx);
        } catch (err) {
            console.error("Withdrawal failed:", err);
        } finally {
            setWithdrawMode(null);
        }
    };

    if (loading) {
        return (
            <div className="container flex items-center justify-center min-h-[60vh] pt-32">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-primary" size={32} />
                    <p className="text-secondary">Loading investment details...</p>
                </div>
            </div>
        );
    }

    if (!investment) {
        return (
            <div className="container pt-32 text-center">
                <div className="glass-container inline-block p-8 max-w-lg w-full">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Investment Not Found</h1>
                    <p className="text-secondary mb-6">
                        Could not find investment details in our database.
                        <br />
                        <span className="text-sm opacity-70">If you just deposited, it might need to be synced.</span>
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className="neon-button w-full flex items-center justify-center gap-2"
                        >
                            {isScanning ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                            {isScanning ? "SCANNING BLOCKCHAIN..." : "SCAN & RECOVER INVESTMENT"}
                        </button>

                        <Link href="/profile" className="neon-button secondary w-full">
                            Back to Profile
                        </Link>
                    </div>

                    {scanError && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                            {scanError}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="container flex items-center justify-center min-h-[60vh] pt-32">
                <div className="glass-container text-center max-w-md w-full p-8">
                    <Wallet size={48} className="mx-auto mb-4 text-primary" />
                    <h1 className="text-2xl font-bold mb-2">Connect Wallet</h1>
                    <p className="text-secondary mb-6">Connect your wallet to manage your investment.</p>
                    <div className="flex justify-center">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    const isProfitable = parseFloat(pnl) >= 0;

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />

            <div className="container" style={{ maxWidth: '1200px', paddingTop: '140px', paddingBottom: '60px' }}>
                <div className="investment-topbar">
                    <Link href="/profile" className="inline-flex items-center text-sm text-secondary hover:text-white transistion-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Profile
                    </Link>
                    <a
                        href={getExplorerUrl(41454, investment.tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-pill"
                    >
                        TX: {shortenAddress(investment.tx_hash)}
                        <ExternalLink size={12} className="ml-1" />
                    </a>
                </div>

                <div className="glass-container investment-hero">
                    <div className="investment-hero-main">
                        <div className="investment-badges">
                            <span className="status-pill">ACTIVE CIRCUIT</span>
                            <span className="meta-pill">
                                <Lock size={12} /> {new Date(investment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="investment-title">{investment.agents?.name || 'Unknown Agent'}</h1>
                        <p className="investment-subtitle">
                            Allocation secured on the agent vault. Track value and manage withdrawals below.
                        </p>
                    </div>
                    <div className="investment-hero-performance">
                        <div className="perf-label">Total Return</div>
                        <div className={`perf-value ${isProfitable ? 'plus' : 'minus'}`}>
                            {isProfitable ? '+' : ''}{pnlPercentage}%
                        </div>
                        <div className={`perf-sub ${isProfitable ? 'plus' : 'minus'}`}>
                            {isProfitable ? '+' : ''}{pnl} USDT
                        </div>
                    </div>
                </div>

                <div className="investment-stats">
                    <div className="stat-tile">
                        <div className="stat-label">Initial Capital</div>
                        <div className="stat-number">
                            {(parseFloat(investment.amount || '0') > 0
                                ? parseFloat(investment.amount)
                                : parseFloat(fallbackAmount || '0')
                            ).toFixed(2)} USDT
                        </div>
                        <div className="stat-meta">
                            {(parseFloat(investment.shares || '0') > 0
                                ? parseFloat(investment.shares)
                                : parseFloat(fallbackShares || '0')
                            ).toFixed(4)} shares owned
                        </div>
                    </div>
                    <div className="stat-tile">
                        <div className="stat-label">Current Value</div>
                        <div className="stat-number">
                            <TrendingUp size={14} className={isProfitable ? 'text-green-500' : 'text-red-500'} />
                            {parseFloat(currentValue).toFixed(2)} USDT
                        </div>
                        <div className="stat-meta">Mark-to-market</div>
                    </div>
                    <div className="stat-tile">
                        <div className="stat-label">Vault State</div>
                        <div className="stat-number">
                            <span className="live-dot" />
                            Live
                        </div>
                        <a
                            href={getExplorerUrl(41454, investment.agents?.vault_address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="stat-meta link"
                        >
                            {shortenAddress(investment.agents?.vault_address || '')}
                        </a>
                    </div>
                </div>

                <div className="investment-grid">
                    <div className="investment-main">
                        <div className="glass-container investment-panel">
                            <div className="panel-header">
                                <h3 className="panel-title">
                                    <DollarSign size={18} className="text-primary" />
                                    Position Management
                                </h3>
                                <span className="panel-tag">Manage Withdrawals</span>
                            </div>
                            <div className="panel-body">
                                <div className="panel-actions">
                                    <button
                                        onClick={() => handleWithdraw('profit')}
                                        disabled={isWithdrawing || parseFloat(pnl) <= 0}
                                        className={`neon-button secondary flex-1 ${isWithdrawing && withdrawMode === 'profit' ? 'opacity-80' : ''} ${parseFloat(pnl) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isWithdrawing && withdrawMode === 'profit' ? 'Processing...' : 'Withdraw Profits Only'}
                                    </button>
                                    <button
                                        onClick={() => handleWithdraw('all')}
                                        disabled={isWithdrawing || parseFloat(currentValue) <= 0}
                                        className={`neon-button flex-1 ${isWithdrawing && withdrawMode === 'all' ? 'opacity-80' : ''}`}
                                    >
                                        {isWithdrawing && withdrawMode === 'all' ? 'Closing Position...' : 'Close Position (Withdraw All)'}
                                    </button>
                                </div>

                                <div className="panel-note">
                                    {parseFloat(pnl) <= 0
                                        ? '* Profit withdrawal enabled when position is in profit.'
                                        : 'Profit withdrawal uses on-chain share pricing.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="investment-side">
                    <div className="glass-container p-6 sticky top-32 architecture-card">
                        <div className="architecture-header">
                            <div className="architecture-title">
                                <ShieldCheck size={18} className="text-primary-purple" />
                                <span>Agent Architecture</span>
                            </div>
                            {agentData && (
                                <span className={`architecture-pill ${Number(agentData.apy ?? 0) >= 0 ? 'good' : 'bad'}`}>
                                    APY {Number(agentData.apy ?? 0).toFixed(1)}%
                                </span>
                            )}
                        </div>

                        {agentData ? (
                            <div className="architecture-body">
                                <div className="architecture-core">
                                    <div className="core-icon">
                                        <BarChart3 size={16} />
                                    </div>
                                    <div>
                                        <div className="core-title">{agentData.strategy || 'Neural Momentum'}</div>
                                        <div className="core-sub">{agentData.personality || 'Balanced'} Risk Profile</div>
                                    </div>
                                </div>
                                <p className="core-desc">
                                    {agentData.description || "Autonomous agent optimizing for long-term alpha via deep-learning market analysis."}
                                </p>

                                <div className="architecture-metrics">
                                    <div className="metric-item">
                                        <div className="metric-label">Win Rate</div>
                                        <div className="metric-value">{Number(agentData.winRate ?? 0)}%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">Trades</div>
                                        <div className="metric-value">{Number(agentData.totalTrades ?? 0)}</div>
                                    </div>
                                    <div className="metric-item wide">
                                        <div className="metric-label">Total Agent PnL</div>
                                        <div className={`metric-value ${Number(agentData.totalPnL ?? 0) >= 0 ? 'plus' : 'minus'}`}>
                                            {Number(agentData.totalPnL ?? 0) >= 0 ? '+' : ''}{Number(agentData.totalPnL ?? 0).toFixed(2)} USDT
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/clawdex/agent/${agentData.agentId}`} className="architecture-link">
                                    View Full Agent Protocol
                                </Link>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-secondary">
                                <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-50" />
                                <span className="text-xs">Synchronizing Agent Data...</span>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .investment-topbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }
                .tx-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.4rem 0.8rem;
                    font-size: 0.7rem;
                    border-radius: 999px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.03);
                    color: var(--text-secondary);
                }
                .investment-hero {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 2rem;
                    padding: 2.5rem;
                    margin-bottom: 1.5rem;
                }
                .investment-hero-main {
                    max-width: 640px;
                }
                .investment-badges {
                    display: flex;
                    gap: 0.6rem;
                    align-items: center;
                    margin-bottom: 0.8rem;
                    flex-wrap: wrap;
                }
                .status-pill {
                    padding: 0.35rem 0.8rem;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    background: rgba(168, 85, 247, 0.2);
                    border: 1px solid rgba(168, 85, 247, 0.3);
                    color: var(--primary-purple);
                }
                .meta-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }
                .investment-title {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }
                .investment-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                }
                .investment-hero-performance {
                    background: rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 1.5rem 2rem;
                    min-width: 220px;
                    text-align: right;
                }
                .perf-label {
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--text-dim);
                }
                .perf-value {
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin-top: 0.3rem;
                }
                .perf-value.plus { color: #10b981; }
                .perf-value.minus { color: #ef4444; }
                .perf-sub {
                    font-size: 0.85rem;
                    font-family: var(--font-mono);
                }
                .perf-sub.plus { color: #10b981; }
                .perf-sub.minus { color: #ef4444; }

                .investment-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                .stat-tile {
                    background: rgba(0,0,0,0.25);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 1.2rem;
                }
                .stat-label {
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--text-dim);
                    margin-bottom: 0.4rem;
                }
                .stat-number {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.4rem;
                    font-weight: 800;
                }
                .stat-meta {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    margin-top: 0.4rem;
                }
                .stat-meta.link {
                    color: var(--primary-purple);
                }
                .live-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 999px;
                    background: #10b981;
                    box-shadow: 0 0 10px rgba(16,185,129,0.8);
                }

                .investment-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
                    gap: 1.5rem;
                }
                .investment-panel {
                    padding: 2rem;
                }
                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 0.6rem;
                }
                .panel-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.1rem;
                }
                .panel-tag {
                    font-size: 0.65rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--text-dim);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.3rem 0.6rem;
                    border-radius: 999px;
                }
                .panel-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .panel-note {
                    margin-top: 0.8rem;
                    font-size: 0.75rem;
                    color: var(--text-dim);
                }

                @media (max-width: 1024px) {
                    .investment-hero {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .investment-hero-performance {
                        width: 100%;
                        text-align: left;
                    }
                    .investment-grid {
                        grid-template-columns: 1fr;
                    }
                    .investment-side .glass-container {
                        position: static;
                    }
                }

                .architecture-card {
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    background: linear-gradient(160deg, rgba(18, 18, 30, 0.9), rgba(10, 10, 15, 0.95));
                }
                .architecture-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    margin-bottom: 1.25rem;
                }
                .architecture-title {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.95rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }
                .architecture-pill {
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    padding: 0.35rem 0.7rem;
                    border-radius: 999px;
                    border: 1px solid;
                }
                .architecture-pill.good {
                    color: #10b981;
                    border-color: rgba(16,185,129,0.4);
                    background: rgba(16,185,129,0.1);
                }
                .architecture-pill.bad {
                    color: #ef4444;
                    border-color: rgba(239,68,68,0.4);
                    background: rgba(239,68,68,0.08);
                }
                .architecture-body {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .architecture-core {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.9rem 1rem;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.06);
                }
                .core-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: rgba(168, 85, 247, 0.18);
                    display: grid;
                    place-items: center;
                    color: var(--primary-purple);
                }
                .core-title {
                    font-size: 1rem;
                    font-weight: 800;
                }
                .core-sub {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }
                .core-desc {
                    font-size: 0.78rem;
                    color: var(--text-dim);
                    line-height: 1.6;
                }
                .architecture-metrics {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.8rem;
                }
                .metric-item {
                    padding: 0.85rem;
                    background: rgba(0,0,0,0.25);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    text-align: left;
                }
                .metric-item.wide {
                    grid-column: 1 / -1;
                }
                .metric-label {
                    font-size: 0.65rem;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: var(--text-dim);
                }
                .metric-value {
                    margin-top: 0.35rem;
                    font-size: 1rem;
                    font-weight: 800;
                }
                .metric-value.plus { color: #10b981; }
                .metric-value.minus { color: #ef4444; }
                .architecture-link {
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: var(--primary-purple);
                    border: 1px dashed rgba(168, 85, 247, 0.4);
                    transition: all 0.2s;
                }
                .architecture-link:hover {
                    background: rgba(168, 85, 247, 0.12);
                    border-color: rgba(168, 85, 247, 0.6);
                    color: white;
                }
            `}</style>
        </div>
    );
}

// Helper component for Loader
function Loader2({ className, size }: { className?: string, size?: number }) {
    return <RefreshCw className={className} size={size} />;
}
