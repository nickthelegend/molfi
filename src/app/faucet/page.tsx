"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
    Zap,
    ShieldCheck,
    Loader2,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Database,
    ExternalLink,
    Search
} from "lucide-react";

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`;
const USDC_ABI = [
    { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }
] as const;

export default function FaucetPage() {
    const { address, isConnected } = useAccount();
    const [isMinting, setIsMinting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    const { data: decimals } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "decimals",
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const requestTokens = async () => {
        if (!address) return;

        setIsMinting(true);
        setError(null);
        setSuccess(false);
        setTxHash(null);

        try {
            const res = await fetch("/api/faucet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Minting failed");
            }

            setTxHash(data.txHash);
            setSuccess(true);

            // Refresh balance after a short delay
            setTimeout(() => refetchBalance(), 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to request tokens. Please try again.");
        } finally {
            setIsMinting(false);
        }
    };

    if (!mounted) return null;

    const formattedBalance = balance !== undefined
        ? Number(formatUnits(balance, decimals || 18)).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : "0.0";

    const shortenAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="faucet-page">
            <div className="grid-overlay" />
            <div className="blur-blob-1" />
            <div className="blur-blob-2" />

            <div className="container main-content-faucet">
                <header className="faucet-header text-center animate-in">
                    <h1 className="faucet-title text-glow">mUSD.dev Faucet</h1>
                    <p className="faucet-subtitle">
                        Receive 1,000 test mUSD.dev tokens to test features on the Monad ecosystem.
                        Tokens are minted server-side — no gas required from your wallet.
                    </p>
                </header>

                <div className="faucet-card-wrapper animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="premium-faucet-card">
                        <div className="card-top">
                            <div className="distribution-info">
                                <div className="lightning-box">
                                    <Zap size={24} fill="currentColor" />
                                </div>
                                <div className="distribution-text">
                                    <h3>mUSD.dev Distribution</h3>
                                    <p>Monad Testnet | ERC-20</p>
                                </div>
                            </div>
                            <div className="verified-badge">
                                <ShieldCheck size={14} />
                                <span>VERIFIED</span>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-label">
                                    <Search size={12} />
                                    <span>WALLET ADDRESS</span>
                                </div>
                                <div className={`stat-value ${!isConnected ? 'dim' : ''}`}>
                                    {isConnected ? shortenAddr(address!) : "NOT CONNECTED"}
                                </div>
                            </div>
                            <div className="stat-card border-purple">
                                <div className="stat-label">
                                    <Database size={12} />
                                    <span>CURRENT BALANCE</span>
                                </div>
                                <div className="stat-value-row">
                                    <span className="value-num">{formattedBalance}</span>
                                    <span className="value-unit">mUSD.dev</span>
                                </div>
                            </div>
                        </div>

                        <div className="claim-box">
                            <div className="claim-header">
                                <span className="claim-label">CLAIM AMOUNT:</span>
                                <span className="claim-amount">1,000.00 mUSD.dev</span>
                            </div>

                            <button
                                className={`request-btn ${isMinting ? 'loading' : ''} ${success ? 'success' : ''}`}
                                onClick={requestTokens}
                                disabled={isMinting || !isConnected}
                            >
                                {isMinting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>MINTING ON-CHAIN...</span>
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>TOKENS DISTRIBUTED ✓</span>
                                    </>
                                ) : (
                                    <>
                                        <span>REQUEST TEST TOKENS</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="error-box animate-in">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        {txHash && success && (
                            <div className="success-footer animate-in">
                                <a
                                    href={`https://monad-testnet.socialscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="explorer-link"
                                >
                                    View Transaction on Explorer <ExternalLink size={12} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="faucet-footer-minimal text-center animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-center gap-xl text-[10px] font-bold tracking-widest text-dim uppercase">
                        <span>L1 Layer: Monad Testnet</span>
                        <div className="dot-separator" />
                        <span>Gasless Minting</span>
                        <div className="dot-separator" />
                        <span>Server-Side Distribution</span>
                    </div>
                </footer>
            </div>

            <style jsx>{`
                .faucet-page {
                    min-height: 100vh;
                    background: #050508;
                    color: white;
                    padding-bottom: 5rem;
                    position: relative;
                    overflow: hidden;
                }

                .main-content-faucet {
                    position: relative;
                    z-index: 10;
                    padding-top: 10vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .blur-blob-1 {
                    position: fixed;
                    top: -10%;
                    left: 20%;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
                    filter: blur(100px);
                    z-index: 0;
                }

                .blur-blob-2 {
                    position: fixed;
                    bottom: 10%;
                    right: 10%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%);
                    filter: blur(80px);
                    z-index: 0;
                }

                .faucet-header {
                    margin-bottom: 3rem;
                    max-width: 600px;
                }

                .faucet-title {
                    font-size: 5rem;
                    font-weight: 800;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.04em;
                    line-height: 1;
                }

                .text-glow {
                    text-shadow: 0 0 40px rgba(168, 85, 247, 0.4);
                }

                .faucet-subtitle {
                    color: var(--text-dim);
                    font-size: 1.15rem;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .faucet-card-wrapper {
                    width: 100%;
                    max-width: 680px;
                    padding: 2px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), transparent, rgba(168, 85, 247, 0.2));
                    border-radius: 40px;
                }

                .premium-faucet-card {
                    background: #0a0a0c;
                    border-radius: 38px;
                    padding: 3.5rem;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3.5rem;
                }

                .distribution-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .lightning-box {
                    width: 58px;
                    height: 58px;
                    background: var(--primary-purple);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
                }

                .distribution-text h3 {
                    font-size: 1.75rem;
                    margin: 0;
                    line-height: 1.2;
                }

                .distribution-text p {
                    font-size: 0.9rem;
                    color: var(--text-dim);
                    font-weight: 600;
                    margin: 0.25rem 0 0;
                    letter-spacing: 0.02em;
                }

                .verified-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(16, 185, 129, 0.08);
                    color: #10b981;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    border: 1px solid rgba(16, 185, 129, 0.1);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 2rem;
                    height: 140px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                }

                .stat-card.border-purple {
                    border-color: rgba(168, 85, 247, 0.3);
                    background: rgba(168, 85, 247, 0.02);
                }

                .stat-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--text-dim);
                    letter-spacing: 0.1em;
                }

                .stat-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    word-break: break-all;
                }

                .stat-value.dim {
                    color: rgba(255, 255, 255, 0.2);
                    font-weight: 600;
                }

                .stat-value-row {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                }

                .value-num {
                    font-size: 2.5rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .value-unit {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: var(--primary-purple);
                }

                .claim-box {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 2.5rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .claim-box:hover {
                    border-color: rgba(168, 85, 247, 0.3);
                }

                .claim-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .claim-label {
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--text-dim);
                    letter-spacing: 0.05em;
                }

                .claim-amount {
                    font-size: 14px;
                    font-weight: 800;
                    color: white;
                }

                .request-btn {
                    width: 100%;
                    height: 72px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    color: var(--text-dim);
                    font-weight: 800;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    letter-spacing: 0.05em;
                    padding: 0 2rem;
                }

                .request-btn:hover:not(:disabled) {
                    background: white;
                    color: black;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1);
                }

                .request-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .request-btn.loading {
                    background: rgba(168, 85, 247, 0.1);
                    border-color: rgba(168, 85, 247, 0.3);
                    color: white;
                }

                .request-btn.success {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #10b981;
                }

                .error-box {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px;
                    color: #ef4444;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 700;
                }

                .success-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .explorer-link {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--primary-purple);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    opacity: 0.8;
                    transition: 0.2s;
                }

                .explorer-link:hover {
                    opacity: 1;
                    text-decoration: underline;
                }

                .faucet-footer-minimal {
                    margin-top: 4rem;
                }

                .dot-separator {
                    width: 4px;
                    height: 4px;
                    background: rgba(168, 85, 247, 0.3);
                    border-radius: 50%;
                }

                .animate-in {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 680px) {
                    .stats-grid { grid-template-columns: 1fr; }
                    .faucet-title { font-size: 3rem; }
                    .premium-faucet-card { padding: 2rem; }
                    .card-top { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .verified-badge { align-self: flex-start; }
                }
            `}</style>
        </div>
    );
}
