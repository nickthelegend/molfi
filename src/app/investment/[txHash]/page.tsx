
"use client";

import { use, useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { ArrowLeft, ExternalLink, TrendingUp, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import MolfiAgentVaultABI from '@/abis/MolfiAgentVault.json';
import { shortenAddress, getExplorerUrl } from '@/lib/contract-helpers';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function InvestmentDetailsPage({ params }: { params: Promise<{ txHash: string }> }) {
    const { txHash } = use(params);
    const { address, isConnected } = useAccount();
    const [investment, setInvestment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentValue, setCurrentValue] = useState<string>('0');
    const [pnl, setPnl] = useState<string>('0');
    const [pnlPercentage, setPnlPercentage] = useState<string>('0');

    // Wagmi hooks for withdrawal
    const { writeContract, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();

    // Fetch investment data
    useEffect(() => {
        const fetchInvestment = async () => {
            try {
                const res = await fetch(`/api/investments/${txHash}`);
                const data = await res.json();
                if (data.success) {
                    setInvestment(data.investment);
                }
            } catch (error) {
                console.error('Failed to fetch investment:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestment();
    }, [txHash]);

    // Read current share value from contract
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
            setPnlPercentage(((pnlValue / initialAmount) * 100).toFixed(2));
        }
    }, [shareValue, investment]);

    const handleWithdraw = () => {
        if (!investment?.agents?.vault_address) return;

        writeContract({
            address: investment.agents.vault_address as `0x${string}`,
            abi: MolfiAgentVaultABI,
            functionName: 'redeem',
            args: [
                parseEther(investment.shares.toString()),
                address,
                address
            ],
        });
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
                <div className="glass-container inline-block p-8">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <h1 className="text-2xl font-bold mb-2">Investment Not Found</h1>
                    <p className="text-secondary mb-6">Could not find investment details for this transaction.</p>
                    <Link href="/profile" className="neon-button">
                        Back to Profile
                    </Link>
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
        <div className="container max-w-4xl mx-auto pt-32 px-4 pb-12">
            <Link href="/profile" className="inline-flex items-center text-sm text-secondary hover:text-white mb-6 transistion-colors">
                <ArrowLeft size={16} className="mr-2" />
                Back to Profile
            </Link>

            <div className="glass-container p-8 mb-8">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                                ACTIVE INVESTMENT
                            </span>
                            <span className="text-secondary text-sm flex items-center gap-1">
                                {new Date(investment.created_at).toLocaleDateString()}
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
                                {shortenAddress(investment.tx_hash)}
                                <ExternalLink size={12} className="ml-1" />
                            </a>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-secondary text-sm mb-1">Total PnL</p>
                        <p className={`text-3xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                            {isProfitable ? '+' : ''}{pnlPercentage}%
                        </p>
                        <p className={`text-sm font-mono ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                            {isProfitable ? '+' : ''}{pnl} ETH
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <p className="text-secondary text-xs uppercase tracking-wider mb-1">Initial Deposit</p>
                        <p className="text-xl font-bold font-mono">{parseFloat(investment.amount).toFixed(4)} ETH</p>
                        <p className="text-xs text-secondary mt-1">
                            {parseFloat(investment.shares).toFixed(4)} Shares
                        </p>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <p className="text-secondary text-xs uppercase tracking-wider mb-1">Current Value</p>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className={isProfitable ? 'text-green-500' : 'text-red-500'} />
                            <p className="text-xl font-bold font-mono">{parseFloat(currentValue).toFixed(4)} ETH</p>
                        </div>
                        <p className="text-xs text-secondary mt-1">Based on current share price</p>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <p className="text-secondary text-xs uppercase tracking-wider mb-1">Vault Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-lg font-bold">Active</p>
                        </div>
                        <a
                            href={getExplorerUrl(41454, investment.agents?.vault_address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 block"
                        >
                            View Contract
                        </a>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                    <h3 className="text-lg font-bold mb-4">Manage Investment</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={handleWithdraw}
                            disabled={isWithdrawing || parseFloat(currentValue) <= 0}
                            className={`neon-button w-full md:w-auto ${isWithdrawing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isWithdrawing ? 'Withdrawing...' : 'Withdraw All Capital'}
                        </button>
                    </div>
                    {parseFloat(currentValue) <= 0 && (
                        <p className="text-sm text-yellow-500 mt-2">
                            No active balance to withdraw.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
