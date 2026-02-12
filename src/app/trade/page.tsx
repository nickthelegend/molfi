"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
    TrendingUp,
    TrendingDown,
    Zap,
    DollarSign,
    ArrowUpRight,
    Activity,
    Shield,
    LayoutGrid,
    History,
    Wallet,
    Info
} from 'lucide-react';
import TradingViewChart from '@/components/TradingViewChart';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLivePrices } from '@/lib/useLivePrices';
import { useTrade, useTraderPositions } from '@/hooks/useTrade';
import { Loader2 } from 'lucide-react';

export default function TradePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return <TradePageContent />;
}

function TradePageContent() {
    const { isConnected, address } = useAccount();
    const [selectedPair, setSelectedPair] = useState<'BTC/USDT' | 'ETH/USDT'>('BTC/USDT');
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [side, setSide] = useState<'long' | 'short'>('long');
    const [size, setSize] = useState('1000');
    const [collateral, setCollateral] = useState('100');
    const [leverage, setLeverage] = useState(10);
    const [limitPrice, setLimitPrice] = useState('');

    const prices = useLivePrices();
    const currentLivePrice = prices.get(selectedPair)?.price || (selectedPair === 'BTC/USDT' ? 45250 : 2480);

    const { openPosition, closePosition, isPending: isTradePending, isConfirming: isTradeConfirming } = useTrade();
    const { data: positionIds, refetch: refetchPositions } = useTraderPositions(address as string);

    const handleOpenPosition = async () => {
        try {
            // Mock agent for now if none selected, in production we'd select from user's agents
            const mockAgent = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

            await openPosition(
                mockAgent,
                selectedPair,
                parseFloat(size),
                parseFloat(collateral),
                leverage,
                side === 'long'
            );
        } catch (err) {
            console.error("Trade failed:", err);
        }
    };

    const calculateLiquidationPrice = () => {
        const entryPrice = currentLivePrice;
        const maxLoss = parseFloat(collateral) * 0.8;
        const priceChange = (maxLoss * entryPrice) / (parseFloat(size) * leverage);

        return side === 'long'
            ? (entryPrice - priceChange).toFixed(2)
            : (entryPrice + priceChange).toFixed(2);
    };

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="novel-card" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '3rem' }}>
                    <div className="float-anim mb-lg">
                        <Zap size={64} className="text-primary" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Initiate Trading</h1>
                    <p className="text-secondary mb-xl">Connect your cryptographic signature to access the Aether-Sign Perps protocol.</p>
                    <div className="flex justify-center">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="grid-overlay" />

            <div className="container" style={{ paddingTop: '120px', maxWidth: '1600px' }}>
                {/* Header with Stats */}
                <div className="flex items-center justify-between mb-xl">
                    <div className="flex items-center gap-xl">
                        <div className="flex items-center gap-md">
                            <div className="glass-icon-button" style={{ borderRadius: '50%' }}>
                                <Zap size={24} className="text-primary" />
                            </div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0' }}>Perpetuals</h1>
                        </div>
                        <div className="flex items-center gap-xl ml-xl" style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
                            <div
                                className={`cursor-pointer px-4 py-2 rounded-lg transition-all ${selectedPair === 'BTC/USDT' ? 'bg-primary-05 border-primary' : 'hover:bg-glass-hover'}`}
                                style={{ border: selectedPair === 'BTC/USDT' ? '1px solid var(--primary-purple)' : '1px solid transparent' }}
                                onClick={() => setSelectedPair('BTC/USDT')}
                            >
                                <span className="text-xs text-dim block">BTC / USDT</span>
                                <span className="font-bold font-mono">
                                    ${prices.get('BTC/USDT')?.price.toLocaleString() || '45,250.00'}
                                </span>
                            </div>
                            <div
                                className={`cursor-pointer px-4 py-2 rounded-lg transition-all ${selectedPair === 'ETH/USDT' ? 'bg-primary-05 border-primary' : 'hover:bg-glass-hover'}`}
                                style={{ border: selectedPair === 'ETH/USDT' ? '1px solid var(--primary-purple)' : '1px solid transparent' }}
                                onClick={() => setSelectedPair('ETH/USDT')}
                            >
                                <span className="text-xs text-dim block">ETH / USDT</span>
                                <span className="font-bold font-mono">
                                    ${prices.get('ETH/USDT')?.price.toLocaleString() || '2,480.20'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-md">
                        <div className="novel-card" style={{ padding: '0.5rem 1rem' }}>
                            <span className="text-xs text-dim mr-md">FUNDING RATE</span>
                            <span className="text-success font-mono font-bold">0.0125%</span>
                        </div>
                        <ConnectButton />
                    </div>
                </div>

                <div className="terminal-grid">
                    {/* Left: Chart & Positions */}
                    <div className="col-span-8">
                        <div className="novel-card mb-xl" style={{ padding: '0' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                                <div className="flex items-center gap-md">
                                    <Activity size={18} className="text-primary" />
                                    <span className="font-bold">{selectedPair} CHART</span>
                                </div>
                                <div className="flex gap-sm">
                                    {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                        <button key={tf} className="glass-icon-button" style={{ width: 'auto', height: '24px', padding: '0 0.5rem', fontSize: '10px' }}>
                                            {tf.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <TradingViewChart pair={selectedPair} height={500} />
                            </div>
                        </div>

                        {/* Positions Section */}
                        <div className="novel-card">
                            <div className="flex items-center justify-between mb-lg">
                                <div className="flex items-center gap-md">
                                    <LayoutGrid size={20} className="text-primary" />
                                    <h3 style={{ fontSize: '1.25rem' }}>ACTIVE CONTRACTS</h3>
                                </div>
                                <div className="flex gap-md">
                                    <span className="text-xs text-dim flex items-center gap-xs">
                                        <History size={14} /> HISTORY
                                    </span>
                                    <span className="text-xs text-dim flex items-center gap-xs">
                                        <Wallet size={14} /> BALANCES
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-md">
                                {Array.isArray(positionIds) && positionIds.length > 0 ? (
                                    (positionIds as bigint[]).map((id: bigint) => (
                                        <div key={id.toString()} className="novel-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-md">
                                                    <span className="text-primary font-bold">#{id.toString()}</span>
                                                    <span className="font-mono">{selectedPair}</span>
                                                </div>
                                                <button
                                                    onClick={() => closePosition(Number(id))}
                                                    className="novel-pill"
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none' }}
                                                >
                                                    CLOSE
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
                                        <span className="text-dim">No active perpetual contracts found for this address.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Panel */}
                    <div className="col-span-4">
                        <div className="novel-card" style={{ height: '100%' }}>
                            <div className="flex items-center gap-md mb-xl">
                                <DollarSign size={20} className="text-primary" />
                                <h3 style={{ fontSize: '1.25rem' }}>EXECUTE TRADE</h3>
                            </div>

                            {/* Order Type Tabs */}
                            <div className="flex gap-xs mb-lg p-xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                {['market', 'limit'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setOrderType(type as any)}
                                        className="flex-1 py-2 text-xs font-bold rounded-lg transition-all"
                                        style={{
                                            background: orderType === type ? 'var(--primary-purple)' : 'transparent',
                                            color: orderType === type ? 'white' : 'var(--text-dim)'
                                        }}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Long/Short Tabs */}
                            <div className="flex gap-md mb-xl">
                                <button
                                    onClick={() => setSide('long')}
                                    className="flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-sm"
                                    style={{
                                        background: side === 'long' ? '#10b981' : 'rgba(16, 185, 129, 0.05)',
                                        border: `1px solid ${side === 'long' ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}`,
                                        color: side === 'long' ? 'white' : '#10b981'
                                    }}
                                >
                                    <TrendingUp size={16} /> LONG
                                </button>
                                <button
                                    onClick={() => setSide('short')}
                                    className="flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-sm"
                                    style={{
                                        background: side === 'short' ? '#ef4444' : 'rgba(239, 68, 68, 0.05)',
                                        border: `1px solid ${side === 'short' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)'}`,
                                        color: side === 'short' ? 'white' : '#ef4444'
                                    }}
                                >
                                    <TrendingDown size={16} /> SHORT
                                </button>
                            </div>

                            {/* Inputs */}
                            <div className="flex flex-col gap-lg mb-xl">
                                {orderType === 'limit' && (
                                    <div>
                                        <div className="flex justify-between mb-xs">
                                            <label className="text-xs text-dim font-bold uppercase">Limit Price</label>
                                            <span className="text-xs text-primary font-mono cursor-pointer">LAST: ${currentLivePrice.toFixed(2)}</span>
                                        </div>
                                        <div className="novel-search-container">
                                            <span className="font-bold text-dim">$</span>
                                            <input
                                                type="number"
                                                className="novel-search-input"
                                                placeholder={currentLivePrice.toFixed(2)}
                                                value={limitPrice}
                                                onChange={(e) => setLimitPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between mb-xs">
                                        <label className="text-xs text-dim font-bold uppercase">Size (USDT)</label>
                                        <span className="text-xs text-primary font-mono cursor-pointer">MAX PAY: ${collateral}</span>
                                    </div>
                                    <div className="novel-search-container">
                                        <span className="font-bold text-dim">$</span>
                                        <input
                                            type="number"
                                            className="novel-search-input"
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-xs">
                                        {[0.25, 0.5, 0.75, 1].map(p => (
                                            <button key={p} className="flex-1 text-[10px] text-dim border border-glass-border rounded py-1 hover:border-primary">
                                                {p * 100}%
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-dim font-bold uppercase mb-xs block">Leverage: {leverage}x</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        className="w-full custom-range"
                                        value={leverage}
                                        onChange={(e) => setLeverage(parseInt(e.target.value))}
                                    />
                                    <div className="flex justify-between text-[10px] text-dim mt-xs">
                                        <span>1x</span>
                                        <span>10x</span>
                                        <span>25x</span>
                                        <span>50x</span>
                                    </div>
                                </div>
                            </div>

                            {/* Totals & Risks */}
                            <div className="novel-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                                <div className="flex flex-col gap-sm">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-dim">Liq. Price</span>
                                        <span className="font-mono text-error font-bold">${calculateLiquidationPrice()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-dim">Collateral</span>
                                        <span className="font-mono">${(parseFloat(size) / leverage).toFixed(2)} USDT</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-dim">Protocol Fee</span>
                                        <span className="font-mono text-primary">$0.10</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleOpenPosition}
                                disabled={isTradePending || isTradeConfirming}
                                className="neon-button mt-xl"
                                style={{
                                    width: '100%',
                                    background: side === 'long' ? '#10b981' : '#ef4444',
                                    border: 'none',
                                    opacity: (isTradePending || isTradeConfirming) ? 0.7 : 1,
                                    cursor: (isTradePending || isTradeConfirming) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {(isTradePending || isTradeConfirming) ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {isTradeConfirming ? 'CONFIRMING...' : 'OPENING...'}
                                    </>
                                ) : (
                                    side === 'long' ? 'OPEN LONG' : 'OPEN SHORT'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .w-full { width: 100%; }
                .text-error { color: #ef4444; }
                .bg-primary-05 { background: rgba(168, 85, 247, 0.05); }
                .border-primary { border-color: var(--primary-purple) !important; }
                .hover\:bg-glass-hover:hover { background: var(--glass-bg-hover); }
                .ml-xl { margin-left: 2rem; }
                
                .custom-range {
                    -webkit-appearance: none;
                    height: 6px;
                    border-radius: 5px;
                    background: rgba(168, 85, 247, 0.2);
                    outline: none;
                }
                .custom-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--primary-purple);
                    cursor: pointer;
                    box-shadow: var(--glow-purple);
                }
            `}</style>
        </div >
    );
}
