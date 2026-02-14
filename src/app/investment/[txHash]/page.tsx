
"use client";

import { use, useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatEther, parseEther, decodeEventLog } from 'viem';
import { ArrowLeft, ExternalLink, TrendingUp, Wallet, AlertCircle, RefreshCw, DollarSign, Lock, BarChart3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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

    // Wagmi hooks for withdrawal
    const { writeContractAsync, isPending: isWithdrawing } = useWriteContract();
    const publicClient = usePublicClient();
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<string>('');

    // Auto-recovery effect
    useEffect(() => {
        if (!loading && !investment && !isScanning && !scanError) {
            handleScan();
        }
    }, [loading, investment]);

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

                if (!createRes.ok) throw new Error("Database sync failed. Please contact support.");

                setScanStatus("Restoration complete. Reloading...");
                window.location.reload();
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

    // Fetch investment data
    useEffect(() => {
        const fetchInvestment = async () => {
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
                setLoading(false);
            }
        };

        fetchInvestment();
    }, [txHash]);

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
        args: [investment ? parseEther(investment.shares.toString()) : 0n],
        query: {
            enabled: !!investment?.agents?.vault_address && !!investment?.shares,
        }
    });

    // Update PnL when share value is fetched
    useEffect(() => {
        if (shareValue && investment) {
            const currentVal = formatEther(shareValue as bigint);
            setCurrentValue(currentVal);

            const initialAmount = parseFloat(investment.amount);
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
            if (mode === 'all') {
                // Redeem full shares
                tx = await writeContractAsync({
                    address: investment.agents.vault_address as `0x${string}`,
                    abi: MolfiAgentVaultABI,
                    functionName: 'redeem',
                    args: [
                        parseEther(investment.shares.toString()),
                        address,
                        address
                    ],
                });
            } else {
                // Withdraw Profit Only
                // Profit = Current Value - Initial Investment
                const initialAmount = parseFloat(investment.amount);
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
        <div className="container max-w-6xl mx-auto pt-32 px-4 pb-12">
            <Link href="/profile" className="inline-flex items-center text-sm text-secondary hover:text-white mb-6 transistion-colors">
                <ArrowLeft size={16} className="mr-2" />
                Back to Profile
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Investment Card */}
                <div className="lg:col-span-8">
                    <div className="glass-container p-8 mb-8">
                        <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                                        ACTIVE CIRCUIT
                                    </span>
                                    <span className="text-secondary text-sm flex items-center gap-1">
                                        <Lock size={12} /> {new Date(investment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h1 className="text-4xl font-bold mb-2 break-all">{investment.agents?.name || 'Unknown Agent'}</h1>
                                <div className="flex items-center gap-4">
                                    <a
                                        href={getExplorerUrl(41454, investment.tx_hash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-secondary hover:text-primary transition-colors"
                                    >
                                        TX: {shortenAddress(investment.tx_hash)}
                                        <ExternalLink size={12} className="ml-1" />
                                    </a>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-secondary text-sm mb-1 uppercase tracking-widest font-bold">Total Return</p>
                                <p className={`text-3xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                                    {isProfitable ? '+' : ''}{pnlPercentage}%
                                </p>
                                <p className={`text-sm font-mono ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                                    {isProfitable ? '+' : ''}{pnl} USDT
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-secondary text-xs uppercase tracking-wider mb-1">Initial Capital</p>
                                <p className="text-xl font-bold font-mono text-white">{parseFloat(investment.amount).toFixed(2)} USDT</p>
                                <p className="text-xs text-secondary mt-1">
                                    {parseFloat(investment.shares).toFixed(4)} Shares Owned
                                </p>
                            </div>

                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-secondary text-xs uppercase tracking-wider mb-1">Current Value</p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className={isProfitable ? 'text-green-500' : 'text-red-500'} />
                                    <p className="text-xl font-bold font-mono text-white">{parseFloat(currentValue).toFixed(2)} USDT</p>
                                </div>
                                <p className="text-xs text-secondary mt-1">Mark-to-Market</p>
                            </div>

                            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p className="text-secondary text-xs uppercase tracking-wider mb-1">Vault State</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-lg font-bold text-white">Live</p>
                                </div>
                                <a
                                    href={getExplorerUrl(41454, investment.agents?.vault_address)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-1 block"
                                >
                                    {shortenAddress(investment.agents?.vault_address || '')}
                                </a>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-8">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <DollarSign size={18} className="text-primary" />
                                Position Management
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4">
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

                            {parseFloat(pnl) <= 0 && (
                                <p className="text-xs text-dim mt-2 text-center md:text-left">
                                    * Profit withdrawal enabled when position is in profit.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Agent Archi/Stats */}
                <div className="lg:col-span-4">
                    <div className="glass-container p-6 sticky top-32">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck size={18} className="text-primary-purple" />
                                AGENT ARCHITECTURE
                            </h3>
                            {agentData && (
                                <span className={`text-xs font-bold px-2 py-1 rounded border ${agentData.roi >= 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                    API: {agentData.roi}%
                                </span>
                            )}
                        </div>

                        {agentData ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-dim uppercase mb-2 block">Strategy Core</label>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                                                <BarChart3 size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white">{agentData.strategy || 'Neural Momentum'}</div>
                                                <div className="text-xs text-secondary">{agentData.personality || 'Balanced'} Risk Profile</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-dim leading-relaxed">
                                            {agentData.description || "Autonomous agent optimizing for long-term alpha via deep-learning market analysis."}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-dim uppercase mb-2 block">Performance Metrics</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                            <div className="text-xs text-secondary mb-1">Win Rate</div>
                                            <div className="text-lg font-bold text-white">{agentData.winRate}%</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                            <div className="text-xs text-secondary mb-1">Total Trades</div>
                                            <div className="text-lg font-bold text-white">{agentData.totalTrades}</div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center col-span-2">
                                            <div className="text-xs text-secondary mb-1">Total Agent PnL</div>
                                            <div className={`text-lg font-bold ${agentData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {agentData.totalPnL >= 0 ? '+' : ''}{agentData.totalPnL.toFixed(2)} USDT
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/clawdex/agent/${agentData.agentId}`} className="block w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5 border border-dashed border-primary/30 rounded-lg transition-colors">
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
    );
}

// Helper component for Loader
function Loader2({ className, size }: { className?: string, size?: number }) {
    return <RefreshCw className={className} size={size} />;
}
