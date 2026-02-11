"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface TradingViewChartProps {
    pair: string;
    height?: number;
}

export default function TradingViewChart({ pair, height = 400 }: TradingViewChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [currentPrice, setCurrentPrice] = useState<string>('0');
    const [priceChange, setPriceChange] = useState<number>(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height,
            layout: {
                background: { color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(168, 85, 247, 0.1)' },
                horzLines: { color: 'rgba(168, 85, 247, 0.1)' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: 'rgba(168, 85, 247, 0.3)',
            },
            timeScale: {
                borderColor: 'rgba(168, 85, 247, 0.3)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        chartRef.current = chart;

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#a855f7',
            downColor: '#ef4444',
            borderUpColor: '#a855f7',
            borderDownColor: '#ef4444',
            wickUpColor: '#a855f7',
            wickDownColor: '#ef4444',
        });

        candlestickSeriesRef.current = candlestickSeries;

        // Generate mock data (replace with real data from API)
        const generateMockData = (): CandlestickData[] => {
            const data: CandlestickData[] = [];
            const basePrice = pair === 'BTC/USDT' ? 45000 : 2500;
            const now = Math.floor(Date.now() / 1000);

            for (let i = 100; i >= 0; i--) {
                const time = (now - i * 3600) as any; // 1 hour candles
                const open = basePrice + (Math.random() - 0.5) * 1000;
                const close = open + (Math.random() - 0.5) * 500;
                const high = Math.max(open, close) + Math.random() * 200;
                const low = Math.min(open, close) - Math.random() * 200;

                data.push({
                    time,
                    open,
                    high,
                    low,
                    close,
                });
            }

            return data;
        };

        const mockData = generateMockData();
        candlestickSeries.setData(mockData);

        // Set current price from last candle
        if (mockData.length > 0) {
            const lastCandle = mockData[mockData.length - 1];
            setCurrentPrice(lastCandle.close.toFixed(2));

            if (mockData.length > 1) {
                const prevCandle = mockData[mockData.length - 2];
                const change = ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100;
                setPriceChange(change);
            }
        }

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [pair, height]);

    // Fetch real-time price updates
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch(`/api/price/${pair.replace('/', '-')}`);
                const data = await response.json();

                if (data.success) {
                    setCurrentPrice(parseFloat(data.price).toFixed(2));
                }
            } catch (error) {
                console.error('Error fetching price:', error);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [pair]);

    return (
        <div style={{ width: '100%' }}>
            {/* Price Header */}
            <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px 12px 0 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{pair}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                            ${currentPrice}
                        </span>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: priceChange >= 0 ? '#10b981' : '#ef4444'
                        }}>
                            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div
                ref={chartContainerRef}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden'
                }}
            />
        </div>
    );
}
