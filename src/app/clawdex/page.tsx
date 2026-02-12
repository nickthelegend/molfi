"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Activity, TrendingUp, TrendingDown, Zap, DollarSign } from 'lucide-react';
import TradingViewChart from '@/components/TradingViewChart';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface OrderbookLevel {
    price: number;
    size: number;
    total: number;
    orders: number;
}

interface Trade {
    id: string;
    price: number;
    size: number;
    side: 'buy' | 'sell';
    timestamp: number;
}

export default function ClawDexPage() {
    const { isConnected, address } = useAccount();
    const [selectedPair, setSelectedPair] = useState<'BTC/USDT' | 'ETH/USDT'>('BTC/USDT');
    const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
    const [side, setSide] = useState<'buy' | 'sell'>('buy');
    const [price, setPrice] = useState('');
    const [size, setSize] = useState('');

    // Orderbook state
    const [bids, setBids] = useState<OrderbookLevel[]>([]);
    const [asks, setAsks] = useState<OrderbookLevel[]>([]);
    const [lastPrice, setLastPrice] = useState(0);

    // Recent trades
    const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

    // Fetch orderbook
    useEffect(() => {
        const fetchOrderbook = async () => {
            try {
                const response = await fetch(`/api/clawdex/orderbook/${selectedPair.replace('/', '-')}`);
                const data = await response.json();

                if (data.success) {
                    setBids(data.orderbook.bids.slice(0, 15));
                    setAsks(data.orderbook.asks.slice(0, 15));
                    setLastPrice(data.orderbook.lastPrice || (selectedPair === 'BTC/USDT' ? 45250 : 2480));
                }
            } catch (error) {
                console.error('Error fetching orderbook:', error);
            }
        };

        fetchOrderbook();
        const interval = setInterval(fetchOrderbook, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [selectedPair]);

    // Fetch recent trades
    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const response = await fetch(`/api/clawdex/trades/${selectedPair.replace('/', '-')}?limit=20`);
                const data = await response.json();

                if (data.success) {
                    setRecentTrades(data.trades);
                }
            } catch (error) {
                console.error('Error fetching trades:', error);
            }
        };

        fetchTrades();
        const interval = setInterval(fetchTrades, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [selectedPair]);

    const handleSubmitOrder = async () => {
        if (!isConnected) {
            alert('Please connect your wallet');
            return;
        }

        if (!size || (orderType === 'limit' && !price)) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/clawdex/order/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trader: address,
                    agent: address, // For now, use same address
                    pair: selectedPair,
                    price: orderType === 'limit' ? parseFloat(price) : 0,
                    size: parseFloat(size),
                    side,
                    type: orderType,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`Order submitted! ID: ${data.order.id}\nStatus: ${data.order.status}`);
                setPrice('');
                setSize('');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit order');
        }
    };

    const maxBidSize = Math.max(...bids.map(b => b.size), 1);
    const maxAskSize = Math.max(...asks.map(a => a.size), 1);

    if (!isConnected) {
        return (
            <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
                <div className="glass-container" style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '2rem' }}>
                    <Activity size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--primary-purple)' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Connect Wallet</h1>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Connect your wallet to access ClawDex.</p>
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
                    <Activity size={32} style={{ color: 'var(--primary-purple)' }} />
                    ClawDex
                </h1>
                <p className="text-secondary" style={{ fontSize: '1.125rem' }}>
                    Professional orderbook trading with full market depth
                </p>
            </div>

            {/* Pair Selector */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => setSelectedPair('BTC/USDT')}
                    className={selectedPair === 'BTC/USDT' ? 'neon-button' : 'neon-button secondary'}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    BTC/USDT
                </button>
                <button
                    onClick={() => setSelectedPair('ETH/USDT')}
                    className={selectedPair === 'ETH/USDT' ? 'neon-button' : 'neon-button secondary'}
                    style={{ padding: '0.75rem 1.5rem' }}
                >
                    ETH/USDT
                </button>
            </div>

            {/* Main Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px 350px', gap: '1.5rem' }}>
                {/* Left: Chart */}
                <div>
                    <TradingViewChart pair={selectedPair} height={600} />
                </div>

                {/* Middle: Orderbook */}
                <div className="glass-container" style={{ padding: '0', height: 'fit-content' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Order Book</h3>
                    </div>

                    {/* Orderbook Display */}
                    <div style={{ height: '550px', overflow: 'hidden' }}>
                        {/* Asks (Sell Orders) */}
                        <div style={{ height: '250px', overflow: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
                            {asks.map((ask, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.875rem',
                                        position: 'relative',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setPrice(ask.price.toString())}
                                >
                                    {/* Background bar */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: `${(ask.size / maxAskSize) * 100}%`,
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            zIndex: 0,
                                        }}
                                    />
                                    <span style={{ color: '#ef4444', fontWeight: 600, position: 'relative', zIndex: 1 }}>
                                        {ask.price.toFixed(2)}
                                    </span>
                                    <span style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                        {ask.size.toFixed(4)}
                                    </span>
                                    <span style={{ textAlign: 'right', color: 'var(--text-dim)', position: 'relative', zIndex: 1 }}>
                                        {ask.total.toFixed(4)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Spread */}
                        <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                                    ${lastPrice.toFixed(2)}
                                </div>
                                {bids.length > 0 && asks.length > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        Spread: ${(asks[0]?.price - bids[0]?.price).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bids (Buy Orders) */}
                        <div style={{ height: '250px', overflow: 'auto' }}>
                            {bids.map((bid, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        padding: '0.25rem 0.75rem',
                                        fontSize: '0.875rem',
                                        position: 'relative',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setPrice(bid.price.toString())}
                                >
                                    {/* Background bar */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                            bottom: 0,
                                            width: `${(bid.size / maxBidSize) * 100}%`,
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            zIndex: 0,
                                        }}
                                    />
                                    <span style={{ color: '#10b981', fontWeight: 600, position: 'relative', zIndex: 1 }}>
                                        {bid.price.toFixed(2)}
                                    </span>
                                    <span style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                        {bid.size.toFixed(4)}
                                    </span>
                                    <span style={{ textAlign: 'right', color: 'var(--text-dim)', position: 'relative', zIndex: 1 }}>
                                        {bid.total.toFixed(4)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0.5rem 0.75rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span>Price</span>
                        <span style={{ textAlign: 'right' }}>Size</span>
                        <span style={{ textAlign: 'right' }}>Total</span>
                    </div>
                </div>

                {/* Right: Trading Panel + Recent Trades */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Trading Panel */}
                    <div className="glass-container" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', fontWeight: 600 }}>Place Order</h3>

                        {/* Order Type */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setOrderType('limit')}
                                    className={orderType === 'limit' ? 'neon-button' : 'neon-button secondary'}
                                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                >
                                    Limit
                                </button>
                                <button
                                    onClick={() => setOrderType('market')}
                                    className={orderType === 'market' ? 'neon-button' : 'neon-button secondary'}
                                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                >
                                    Market
                                </button>
                            </div>
                        </div>

                        {/* Side */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSide('buy')}
                                    style={{
                                        padding: '0.75rem',
                                        background: side === 'buy' ? '#10b981' : 'transparent',
                                        border: `1px solid ${side === 'buy' ? '#10b981' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: side === 'buy' ? 'white' : 'var(--text-primary)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => setSide('sell')}
                                    style={{
                                        padding: '0.75rem',
                                        background: side === 'sell' ? '#ef4444' : 'transparent',
                                        border: `1px solid ${side === 'sell' ? '#ef4444' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: side === 'sell' ? 'white' : 'var(--text-primary)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    Sell
                                </button>
                            </div>
                        </div>

                        {/* Price (for limit orders) */}
                        {orderType === 'limit' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Price (USDT)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder={lastPrice.toFixed(2)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            </div>
                        )}

                        {/* Size */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Size ({selectedPair.split('/')[0]})
                            </label>
                            <input
                                type="number"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                placeholder="0.001"
                                step="0.001"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmitOrder}
                            className="neon-button"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: side === 'buy' ? '#10b981' : '#ef4444',
                                border: 'none',
                            }}
                        >
                            {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
                        </button>
                    </div>

                    {/* Recent Trades */}
                    <div className="glass-container" style={{ padding: '0', height: 'fit-content' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Trades</h3>
                        </div>
                        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                            {recentTrades.length > 0 ? (
                                recentTrades.map((trade) => (
                                    <div
                                        key={trade.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr 1fr',
                                            padding: '0.5rem 0.75rem',
                                            fontSize: '0.875rem',
                                            borderBottom: '1px solid var(--glass-border)',
                                        }}
                                    >
                                        <span style={{ color: trade.side === 'buy' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                            {trade.price.toFixed(2)}
                                        </span>
                                        <span style={{ textAlign: 'right' }}>{trade.size.toFixed(4)}</span>
                                        <span style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                            {new Date(trade.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                    No recent trades
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
