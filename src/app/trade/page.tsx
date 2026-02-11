"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import TradingViewChart from '@/components/TradingViewChart';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function TradePage() {
    const { isConnected, address } = useAccount();
    const [selectedPair, setSelectedPair] = useState<'BTC/USDT' | 'ETH/USDT'>('BTC/USDT');
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [side, setSide] = useState<'long' | 'short'>('long');
    const [size, setSize] = useState('1000');
    const [collateral, setCollateral] = useState('100');
    const [leverage, setLeverage] = useState(10);
    const [limitPrice, setLimitPrice] = useState('');

    // Mock positions data
    const mockPositions = [
        {
            id: '1',
            pair: 'BTC/USDT',
            side: 'Long',
            size: '1000',
            entryPrice: '45000',
            currentPrice: '45250',
            pnl: '+55.50',
            pnlPercent: '+5.55',
            leverage: '10x',
            liquidationPrice: '40500',
        },
    ];

    const handleSubmitOrder = async () => {
        if (!isConnected) {
            alert('Please connect your wallet');
            return;
        }

        try {
            const response = await fetch('/api/trade/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: address,
                    pair: selectedPair,
                    size: parseFloat(size),
                    collateral: parseFloat(collateral),
                    leverage,
                    isLong: side === 'long',
                    slippage: 0.5,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Unsigned transaction:', data.unsignedTx);
                console.log('Trade details:', data.tradeDetails);
                alert(`Order created! Entry Price: $${data.tradeDetails.entryPrice}\nLiquidation: $${data.tradeDetails.liquidationPrice}\n\nSign the transaction to execute.`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order');
        }
    };

    const calculateLiquidationPrice = () => {
        const entryPrice = selectedPair === 'BTC/USDT' ? 45250 : 2480;
        const maxLoss = parseFloat(collateral) * 0.8;
        const priceChange = (maxLoss * entryPrice) / (parseFloat(size) * leverage);

        return side === 'long'
            ? (entryPrice - priceChange).toFixed(2)
            : (entryPrice + priceChange).toFixed(2);
    };

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '2rem' }}>
                    <Zap size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Connect your wallet to start trading.</p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem', paddingTop: '120px', maxWidth: '1800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={32} style={{ color: 'var(--primary-purple)' }} />
                    Perpetual Trading
                </h1>
                <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
                    Trade BTC and ETH perpetuals with up to 50x leverage
                </p>
            </div>

            {/* Main Trading Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Left: Chart */}
                <div>
                    <TradingViewChart pair={selectedPair} height={500} />
                </div>

                {/* Right: Trading Panel */}
                <div className="glass-container" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Place Order</h3>

                    {/* Pair Selector */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Trading Pair
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                onClick={() => setSelectedPair('BTC/USDT')}
                                className={selectedPair === 'BTC/USDT' ? 'neon-button' : 'neon-button secondary'}
                                style={{ padding: '0.75rem' }}
                            >
                                BTC/USDT
                            </button>
                            <button
                                onClick={() => setSelectedPair('ETH/USDT')}
                                className={selectedPair === 'ETH/USDT' ? 'neon-button' : 'neon-button secondary'}
                                style={{ padding: '0.75rem' }}
                            >
                                ETH/USDT
                            </button>
                        </div>
                    </div>

                    {/* Order Type */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Order Type
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                onClick={() => setOrderType('market')}
                                className={orderType === 'market' ? 'neon-button' : 'neon-button secondary'}
                                style={{ padding: '0.75rem' }}
                            >
                                Market
                            </button>
                            <button
                                onClick={() => setOrderType('limit')}
                                className={orderType === 'limit' ? 'neon-button' : 'neon-button secondary'}
                                style={{ padding: '0.75rem' }}
                            >
                                Limit
                            </button>
                        </div>
                    </div>

                    {/* Side */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Side
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                onClick={() => setSide('long')}
                                style={{
                                    padding: '0.75rem',
                                    background: side === 'long' ? '#10b981' : 'transparent',
                                    border: `1px solid ${side === 'long' ? '#10b981' : 'var(--glass-border)'}`,
                                    borderRadius: '8px',
                                    color: side === 'long' ? 'white' : 'var(--text-primary)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Long
                            </button>
                            <button
                                onClick={() => setSide('short')}
                                style={{
                                    padding: '0.75rem',
                                    background: side === 'short' ? '#ef4444' : 'transparent',
                                    border: `1px solid ${side === 'short' ? '#ef4444' : 'var(--glass-border)'}`,
                                    borderRadius: '8px',
                                    color: side === 'short' ? 'white' : 'var(--text-primary)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <TrendingDown size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Short
                            </button>
                        </div>
                    </div>

                    {/* Size */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Size (USD)
                        </label>
                        <input
                            type="number"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            placeholder="1000"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    {/* Collateral */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Collateral (USD)
                        </label>
                        <input
                            type="number"
                            value={collateral}
                            onChange={(e) => setCollateral(e.target.value)}
                            placeholder="100"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    {/* Leverage */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span>Leverage</span>
                            <span style={{ color: 'var(--primary-purple)', fontWeight: 600 }}>{leverage}x</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={leverage}
                            onChange={(e) => setLeverage(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                            <span>1x</span>
                            <span>50x</span>
                        </div>
                    </div>

                    {/* Limit Price (if limit order) */}
                    {orderType === 'limit' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Limit Price
                            </label>
                            <input
                                type="number"
                                value={limitPrice}
                                onChange={(e) => setLimitPrice(e.target.value)}
                                placeholder="45000"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>
                    )}

                    {/* Order Summary */}
                    <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span className="text-secondary">Liquidation Price:</span>
                            <span style={{ fontWeight: 600 }}>${calculateLiquidationPrice()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span className="text-secondary">Trading Fee (0.1%):</span>
                            <span style={{ fontWeight: 600 }}>${(parseFloat(size) * 0.001).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitOrder}
                        className="neon-button"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            background: side === 'long' ? '#10b981' : '#ef4444',
                            border: 'none',
                        }}
                    >
                        <DollarSign size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        {side === 'long' ? 'Open Long' : 'Open Short'}
                    </button>
                </div>
            </div>

            {/* Positions Table */}
            <div className="glass-container" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>My Positions</h3>
                </div>

                {mockPositions.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pair</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Side</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Size</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Entry</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Current</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PnL</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Leverage</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Liq. Price</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockPositions.map((position) => (
                                    <tr key={position.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{position.pair}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                background: position.side === 'Long' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                border: `1px solid ${position.side === 'Long' ? '#10b981' : '#ef4444'}`,
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: position.side === 'Long' ? '#10b981' : '#ef4444',
                                            }}>
                                                {position.side}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>${position.size}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>${position.entryPrice}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>${position.currentPrice}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div>
                                                <div style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{position.pnl}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{position.pnlPercent}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--primary-purple)' }}>{position.leverage}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>${position.liquidationPrice}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button className="neon-button secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                                Close
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <Zap size={48} style={{ color: 'var(--text-dim)', opacity: 0.3, margin: '0 auto 1rem' }} />
                        <p className="text-secondary">No open positions</p>
                    </div>
                )}
            </div>
        </div>
    );
}
