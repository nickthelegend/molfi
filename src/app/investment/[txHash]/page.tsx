
"use client";

import { use, useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatEther, parseEther, decodeEventLog } from 'viem';
import { ArrowLeft, ExternalLink, TrendingUp, Wallet, AlertCircle, RefreshCw, DollarSign, Lock, BarChart3, ShieldCheck, Activity, Bot } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MolfiAgentVaultABI from '@/abis/MolfiAgentVault.json';
import { shortenAddress, getExplorerUrl, getTxExplorerUrl } from '@/lib/contract-helpers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AgentPerformanceChart from '@/components/AgentPerformanceChart';

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
            const cleanHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
            const receipt = await publicClient.getTransactionReceipt({ hash: cleanHash as `0x${string}` });

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
                    // Look for ANY log from this vault address that could be a Deposit
                    const vaultLogs = receipt.logs.filter(l => l.address.toLowerCase() === agent.vaultAddress.toLowerCase());

                    for (const log of vaultLogs) {
                        try {
                            const event = decodeEventLog({
                                abi: MolfiAgentVaultABI,
                                data: log.data,
                                topics: log.topics,
                            });

                            if (event.eventName === 'Deposit') {
                                foundAgent = agent;
                                mintedShares = formatEther((event.args as any).shares);
                                amount = formatEther((event.args as any).assets);
                                break;
                            }
                        } catch (e) {
                            // This log might be a different event (e.g. Transfer), skip it
                            continue;
                        }
                    }
                    if (foundAgent) break;
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
                        amount: amount !== '0' ? amount : '100', // Fallback to 100 if amount extraction failed but log found
                        shares: mintedShares !== '0' ? mintedShares : (amount !== '0' ? amount : '100')
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

        // Ensure vault address exists
        const vaultAddr = investment.agents?.vault_address;
        if (!vaultAddr) return;

        const dbAmountNum = parseFloat(investment.amount || '0');
        const dbSharesNum = parseFloat(investment.shares || '0');

        // If we already have real data, don't hydrate
        if (dbAmountNum > 0 && dbSharesNum > 0) return;

        const hydrateFromReceipt = async () => {
            try {
                // Ensure txHash has 0x prefix for wagmi/viem
                const cleanHash = investment.tx_hash.startsWith('0x') ? investment.tx_hash : `0x${investment.tx_hash}`;
                console.log(`[Hydration] Scanning logs for TX: ${cleanHash}`);

                const receipt = await publicClient.getTransactionReceipt({ hash: cleanHash as `0x${string}` });
                if (!receipt) return;

                // Scan logs for Deposit from correct vault
                const vaultLogs = receipt.logs.filter(
                    (l) => l.address.toLowerCase() === vaultAddr.toLowerCase()
                );

                for (const log of vaultLogs) {
                    try {
                        const event = decodeEventLog({
                            abi: MolfiAgentVaultABI,
                            data: log.data,
                            topics: log.topics,
                        });
                        if (event.eventName === 'Deposit') {
                            const assets = formatEther((event.args as any).assets);
                            const shares = formatEther((event.args as any).shares);
                            console.log(`[Hydration] Found Deposit: ${assets} assets`);
                            setFallbackAmount(assets);
                            setFallbackShares(shares);

                            // Proactively update DB if we found missing data
                            fetch('/api/investments/create', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    txHash: investment.tx_hash,
                                    agentId: investment.agents.agentId,
                                    userAddress: investment.user_address,
                                    amount: assets,
                                    shares: shares
                                })
                            }).catch(e => console.error("Sync backup failed", e));

                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            } catch (err) {
                console.error("Hydration failed:", err);
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
    const activeShares = (parseFloat(investment?.shares || '0') > 0
        ? investment.shares
        : fallbackShares).toString();

    const { data: shareValue, refetch: refetchShareValue } = useReadContract({
        address: investment?.agents?.vault_address as `0x${string}`,
        abi: MolfiAgentVaultABI,
        functionName: 'previewRedeem',
        args: [activeShares !== '0' ? parseEther(activeShares) : 0n],
        query: {
            enabled: !!investment?.agents?.vault_address && activeShares !== '0',
            refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
        }
    });

    const [pnlBreakdown, setPnlBreakdown] = useState({ realized: '0', unrealized: '0' });

    const { data: totalSupply } = useReadContract({
        address: investment?.agents?.vault_address as `0x${string}`,
        abi: MolfiAgentVaultABI,
        functionName: 'totalSupply',
        query: {
            enabled: !!investment?.agents?.vault_address,
            refetchInterval: 30000,
        }
    });

    // Update PnL when share value is fetched or agent data updates
    useEffect(() => {
        if (shareValue && (investment || parseFloat(fallbackAmount) > 0)) {
            const currentVal = formatEther(shareValue as bigint);

            const initialAmount = parseFloat(investment?.amount || '0') > 0
                ? parseFloat(investment.amount)
                : parseFloat(fallbackAmount);

            const onChainReturn = parseFloat(currentVal) - initialAmount;
            let calculatedPnl = onChainReturn;
            let uPnL = 0;
            let rPnL = 0;

            // Factor in agent performance if data is available
            if (agentData && totalSupply && parseFloat(activeShares) > 0) {
                const totalSharesNum = parseFloat(formatEther(totalSupply as bigint));
                const ownership = totalSharesNum > 0 ? parseFloat(activeShares) / totalSharesNum : 0;

                uPnL = ownership * (agentData.unrealizedPnL || 0);
                rPnL = ownership * (agentData.realizedPnL || 0);

                // Final profit is realized + unrealized (simulated trades)
                calculatedPnl = rPnL + uPnL;
            }

            setPnl(calculatedPnl.toFixed(4));
            setPnlPercentage(initialAmount > 0 ? ((calculatedPnl / initialAmount) * 100).toFixed(2) : "0.00");
            setCurrentValue((initialAmount + calculatedPnl).toFixed(2));

            setPnlBreakdown({
                realized: rPnL.toFixed(4),
                unrealized: uPnL.toFixed(4)
            });
        }
    }, [shareValue, investment, fallbackAmount, agentData, totalSupply, activeShares]);

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
            setWithdrawHash(tx);
            console.log("Withdrawal TX:", tx);
        } catch (err) {
            console.error("Withdrawal failed:", err);
        } finally {
            setWithdrawMode(null);
        }
    };

    const [withdrawHash, setWithdrawHash] = useState<string | null>(null);
    const { isLoading: isConfirmingWithdraw, isSuccess: withdrawConfirmed } = useWaitForTransactionReceipt({
        hash: withdrawHash as `0x${string}` | undefined,
    });

    // Sync after withdrawal is confirmed
    useEffect(() => {
        if (withdrawConfirmed && investment) {
            const syncWithdrawal = async () => {
                try {
                    console.log("Syncing withdrawal to DB...");
                    await fetch('/api/investments/sync-withdrawal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userAddress: address,
                            agentId: investment.agents.agentId,
                            txHash: withdrawHash,
                            isFullWithdraw: withdrawMode === 'all' || currentValue === '0'
                        })
                    });

                    // Refresh data
                    fetchInvestment(true);
                    setWithdrawHash(null);
                } catch (err) {
                    console.error("Sync withdrawal failed:", err);
                }
            };
            syncWithdrawal();
        }
    }, [withdrawConfirmed, investment, address, withdrawHash]);

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

                        <Link href="/profile" className="neon-button white-secondary w-full">
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
                        href={getTxExplorerUrl(10143, investment.tx_hash)}
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
                        <div className="perf-breakdown">
                            <div className={Number(pnlBreakdown.realized) >= 0 ? 'plus' : 'minus'}>
                                Realized: {Number(pnlBreakdown.realized) >= 0 ? '+' : ''}{pnlBreakdown.realized}
                            </div>
                            <div className={Number(pnlBreakdown.unrealized) >= 0 ? 'plus' : 'minus'}>
                                Floating: {Number(pnlBreakdown.unrealized) >= 0 ? '+' : ''}{pnlBreakdown.unrealized}
                            </div>
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
                        <div className="stat-meta breakdown">
                            <span>Rel: {Number(pnlBreakdown.realized) >= 0 ? '+' : ''}{parseFloat(pnlBreakdown.realized).toFixed(2)}</span>
                            <span>Unrel: {Number(pnlBreakdown.unrealized) >= 0 ? '+' : ''}{parseFloat(pnlBreakdown.unrealized).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="stat-tile">
                        <div className="stat-label">Vault State</div>
                        <div className="stat-number">
                            <span className="live-dot" />
                            Live
                        </div>
                        <a
                            href={getExplorerUrl(10143, investment.agents?.vault_address)}
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

                        {/* INVESTMENT PERFORMANCE CHART */}
                        <div className="glass-container investment-panel mt-6">
                            <div className="panel-header">
                                <h3 className="panel-title">
                                    <TrendingUp size={18} className="text-primary" />
                                    Investment Performance
                                </h3>
                                <span className="panel-tag">Return Over Time</span>
                            </div>
                            <div className="panel-body no-padding overflow-hidden">
                                {agentData?.equityCurve ? (
                                    <div className="py-2">
                                        <AgentPerformanceChart
                                            data={agentData.equityCurve.map((point: any) => {
                                                const initialAmount = parseFloat(investment?.amount || '0') > 0
                                                    ? parseFloat(investment.amount)
                                                    : parseFloat(fallbackAmount);

                                                // Scale Agent Equity ($10k base) to User Investment size
                                                const userValue = (point.value / 10000) * initialAmount;
                                                return {
                                                    time: point.time,
                                                    value: parseFloat(userValue.toFixed(2))
                                                };
                                            })}
                                            height={350}
                                        />
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-secondary opacity-50">
                                        <Activity size={32} className="mx-auto mb-2 animate-pulse" />
                                        <p className="text-sm">Generating Performance Data...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LIVE AGENT ACTIVITY */}
                        <div className="glass-container investment-panel mt-6">
                            <div className="panel-header">
                                <h3 className="panel-title">
                                    <Activity size={18} className="text-primary" />
                                    Live Agent Activity
                                </h3>
                                <span className="panel-tag">Active Positions</span>
                            </div>
                            <div className="panel-body no-padding">
                                {agentData?.activePositions && agentData.activePositions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="active-positions-table">
                                            <thead>
                                                <tr>
                                                    <th>Asset</th>
                                                    <th>Side</th>
                                                    <th>Leverage</th>
                                                    <th>Size</th>
                                                    <th className="text-right">Unrealized PnL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {agentData.activePositions.map((pos: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="font-bold">{pos.pair}</td>
                                                        <td>
                                                            <span className={`side-tag ${pos.side.toLowerCase()}`}>
                                                                {pos.side}
                                                            </span>
                                                        </td>
                                                        <td className="font-mono text-xs">{pos.leverage}x</td>
                                                        <td className="font-mono text-xs">${parseFloat(pos.size).toLocaleString()}</td>
                                                        <td className={`text-right font-mono ${pos.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl} USDT
                                                            <div className="text-[10px] opacity-70">
                                                                ({pos.unrealizedPnlPercent >= 0 ? '+' : ''}{pos.unrealizedPnlPercent}%)
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Bot size={40} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-secondary text-sm">Agent is currently analyzing market for entry...</p>
                                    </div>
                                )}
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
                .perf-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    margin-top: 0.8rem;
                    font-size: 0.65rem;
                    font-family: var(--font-mono);
                    opacity: 0.8;
                }
                .perf-breakdown .plus { color: #10b981; }
                .perf-breakdown .minus { color: #ef4444; }

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
                .stat-meta.breakdown {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    font-family: var(--font-mono);
                    color: var(--text-dim);
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

                .active-positions-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .active-positions-table th {
                    text-align: left;
                    padding: 0.75rem 1rem;
                    color: var(--text-dim);
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .active-positions-table td {
                    padding: 0.8rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .active-positions-table tr:last-child td {
                    border-bottom: none;
                }
                .side-tag {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.65rem;
                    font-weight: 800;
                }
                .side-tag.long {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }
                .side-tag.short {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
                .no-padding {
                    padding: 0 !important;
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

                .neon-button.white-secondary {
                    background: transparent;
                    border-color: rgba(255, 255, 255, 0.3);
                    color: rgba(255, 255, 255, 0.8);
                }
                .neon-button.white-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #ffffff;
                    color: #ffffff;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

// Helper component for Loader
function Loader2({ className, size }: { className?: string, size?: number }) {
    return <RefreshCw className={className} size={size} />;
}
