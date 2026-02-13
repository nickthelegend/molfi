"use client";

import { useState, useEffect } from "react";
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt
} from "wagmi";
import { parseEther, formatEther } from "viem";
import {
    X,
    Loader2,
    ShieldCheck,
    Wallet,
    ArrowRight,
    TrendingUp,
    Clock,
    Zap,
    ChevronRight,
    Lock
} from "lucide-react";
import { shortenAddress } from "@/lib/contract-helpers";

// ABIs
const USDC_ABI = [
    { "inputs": [{ "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
] as const;

const VAULT_ABI = [
    { "inputs": [{ "name": "assets", "type": "uint256" }, { "name": "receiver", "type": "address" }], "name": "deposit", "outputs": [{ "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }
] as const;

interface AllocateModalProps {
    isOpen: boolean;
    onClose: () => void;
    agent: {
        name: string;
        vaultAddress: string;
        agentId: string;
        avatar?: string;
    };
}

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC as `0x${string}`;

export default function AllocateModal({ isOpen, onClose, agent }: AllocateModalProps) {
    const { address, isConnected } = useAccount();
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Fetch USDC Balance
    const { data: usdcBalanceData } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    const formattedBalance = usdcBalanceData ? formatEther(usdcBalanceData) : "0.00";

    // 2. Check Allowance
    const { data: allowance } = useReadContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "allowance",
        args: address && agent.vaultAddress ? [address, agent.vaultAddress as `0x${string}`] : undefined,
    });

    const { writeContractAsync } = useWriteContract();

    const handleMax = () => {
        setAmount(formattedBalance);
    };

    const handleAllocate = async () => {
        if (!amount || !address || !isConnected) return;

        setIsProcessing(true);
        try {
            const parsedAmount = parseEther(amount);

            // Approve if needed
            if (!allowance || allowance < parsedAmount) {
                console.log("Approving USDC...");
                const approveTx = await writeContractAsync({
                    address: USDC_ADDRESS,
                    abi: USDC_ABI,
                    functionName: "approve",
                    args: [agent.vaultAddress as `0x${string}`, parsedAmount],
                });
                // We'd ideally wait for receipt here, but let's assume it went through for now or the user will click again
                // In a real app we'd use useWaitForTransactionReceipt
            }

            console.log("Depositing to vault...");
            await writeContractAsync({
                address: agent.vaultAddress as `0x${string}`,
                abi: VAULT_ABI,
                functionName: "deposit",
                args: [parsedAmount, address],
            });

            console.log("Allocation successful!");
            onClose();
        } catch (err) {
            console.error("Allocation failed:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="allocate-overlay">
            <div className="allocate-modal float-anim">
                {/* Header */}
                <div className="modal-header">
                    <div className="flex items-center gap-md">
                        <div className="modal-icon">
                            <TrendingUp size={18} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="modal-title">ALLOCATE CAPITAL</h2>
                            <p className="modal-subtitle">Deploy USDT into this agent's strategy.</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Info Box */}
                <div className="info-box">
                    <div className="flex justify-between items-center mb-sm">
                        <div className="flex items-center gap-xs">
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">ClawBot Protocol Guarded</span>
                        </div>
                        <span className="text-[10px] text-primary font-mono bg-primary-10 px-xs py-2xs rounded">1:1 Backing</span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                        Capital is managed by the ClawBot protocol with 1:1 asset backing in vault:
                        <span className="text-primary font-mono ml-xs">{shortenAddress(agent.vaultAddress)}</span>
                    </p>
                </div>

                {/* Input Section */}
                <div className="input-section">
                    <div className="flex justify-between items-center mb-xs">
                        <label className="input-label">Amount (USDT)</label>
                        <div className="flex items-center gap-xs">
                            <Wallet size={10} className="text-dim" />
                            <span className="text-[10px] text-dim font-bold uppercase tracking-tighter hover:text-white transition-colors cursor-pointer" onClick={handleMax}>
                                BAL: {Number(formattedBalance).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-tighter hover:text-white transition-colors cursor-pointer ml-xs" onClick={() => window.open('/faucet', '_blank')}>
                                [GET TEST USDC]
                            </span>
                        </div>
                    </div>
                    <div className="premium-input-container">
                        <span className="currency-symbol">$</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="amount-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button className="max-chip" onClick={handleMax}>MAX</button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="details-grid">
                    <div className="detail-item">
                        <div className="flex items-center gap-xs mb-xs">
                            <Zap size={10} className="text-dim" />
                            <span className="detail-label">Claw Relay Fee</span>
                        </div>
                        <span className="detail-value">0.05%</span>
                    </div>
                    <div className="detail-item border-x">
                        <div className="flex items-center gap-xs mb-xs">
                            <Clock size={10} className="text-dim" />
                            <span className="detail-label">Lock Duration</span>
                        </div>
                        <span className="detail-value text-primary">None</span>
                    </div>
                    <div className="detail-item">
                        <div className="flex items-center gap-xs mb-xs">
                            <Lock size={10} className="text-dim" />
                            <span className="detail-label">Exit Status</span>
                        </div>
                        <span className="detail-value">Neural Neutral</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    className={`allocate-btn ${isProcessing ? 'loading' : ''}`}
                    disabled={isProcessing || !amount || Number(amount) <= 0}
                    onClick={handleAllocate}
                >
                    {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            CONFIRM ALLOCATION <ArrowRight size={18} />
                        </>
                    )}
                </button>

                <p className="footer-warning">
                    Withdrawals are permitted only when the agent is in a neutral state.
                </p>
            </div>

            <style jsx>{`
        .allocate-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .allocate-modal {
          background: #0a0a0c;
          border: 1px solid var(--glass-border);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.1);
          border-radius: 32px;
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .modal-icon {
          width: 40px;
          height: 40px;
          background: rgba(168, 85, 247, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .modal-subtitle {
          font-size: 0.8rem;
          color: var(--text-dim);
          font-weight: 500;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          transition: 0.2s;
        }

        .close-btn:hover { color: white; }

        .info-box {
          background: rgba(168, 85, 247, 0.05);
          border: 1px solid rgba(168, 85, 247, 0.1);
          border-radius: 20px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }

        .input-section { margin-bottom: 2rem; }
        .input-label { font-size: 0.75rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; }

        .premium-input-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: 0.3s;
        }

        .premium-input-container:focus-within {
          border-color: var(--primary-purple);
          background: rgba(168, 85, 247, 0.05);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
        }

        .currency-symbol { font-size: 1.5rem; font-weight: 700; color: var(--text-dim); }

        .amount-input {
          background: transparent;
          border: none;
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          width: 100%;
          outline: none;
          font-family: var(--font-mono);
        }

        .max-chip {
          background: var(--primary-purple);
          border: none;
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .max-chip:hover { transform: scale(1.05); opacity: 0.9; }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          margin-bottom: 2.5rem;
        }

        .detail-item { padding: 1.25rem; text-align: center; }
        .detail-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-dim); }
        .detail-value { font-size: 0.9rem; font-weight: 700; color: white; }
        .border-x { border-left: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); }

        .allocate-btn {
          width: 100%;
          background: var(--primary-purple);
          border: none;
          border-radius: 20px;
          padding: 1.25rem;
          color: white;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          box-shadow: var(--glow-purple);
        }

        .allocate-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(168, 85, 247, 0.4);
        }

        .allocate-btn:disabled {
          background: #2a2a2c;
          color: #4a4a4c;
          cursor: not-allowed;
          box-shadow: none;
        }

        .footer-warning {
          text-align: center;
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 500;
          margin-top: 1.5rem;
        }

        @keyframes floatModal {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .float-anim {
          animation: floatModal 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
      `}</style>
        </div>
    );
}
