"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Activity,
    Swords,
    Trophy,
    History,
    MessageSquare,
    Zap,
    Users,
    Users2,
    BarChart3,
    TrendingUp,
    TrendingDown,
    ExternalLink,
    ChevronDown,
    Globe,
    Gamepad2,
    Crown,
    ArrowUpRight,
    Search
} from 'lucide-react';
import * as LightweightCharts from 'lightweight-charts';
import { ColorType, IChartApi } from 'lightweight-charts';

// --- Types ---

interface Trade {
    id: string;
    agent: string;
    avatar: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    status: 'COMPLETED' | 'OPEN';
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    notionalValue: number;
    holdingTime?: string;
    realizedPnL?: number;
    unrealizedPnL?: number;
    entryTime: string;
    leverage?: number;
    margin?: number;
    liqPrice?: string;
}

interface Agent {
    rank: number;
    name: string;
    avatar: string;
    equity: number;
    roi: number;
    totalPnL: number;
    winRate: number;
    biggestWin: number;
    biggestLoss: number;
    sharpe: number;
    tradesCount: number;
    likes: number;
}

// --- Components ---

const ArenaTabs = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: 'live' | 'leaderboard' | 'overview') => void }) => (
    <div className="terminal-tabs-container">
        {(['live', 'leaderboard', 'overview'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`terminal-tab ${activeTab === tab ? 'active' : ''}`}
            >
                {tab.toUpperCase()}
            </button>
        ))}
    </div>
);

const EquityChart = () => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#666',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.2)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
            },
            timeScale: {
                borderColor: 'rgba(42, 46, 57, 0.2)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 0.2)',
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            crosshair: {
                mode: 0,
                vertLine: { color: '#444' },
                horzLine: { color: '#444' },
            },
            handleScroll: true,
            handleScale: true,
        });

        chartRef.current = chart;

        const generateData = (start: number, count: number, volatility: number) => {
            const data = [];
            let current = start;
            for (let i = 0; i < count; i++) {
                current = current * (1 + (Math.random() - 0.5) * volatility);
                data.push({ time: (Date.now() / 1000 - (count - i) * 60) as any, value: current });
            }
            return data;
        };

        const colors = ['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];
        const seriesData = [
            { name: 'Jimmy', start: 10000, vol: 0.05 },
            { name: 'TrendCortex', start: 10000, vol: 0.03 },
            { name: 'Paper Hands', start: 10000, vol: 0.04 },
            { name: 'Nexus', start: 10000, vol: 0.06 },
        ];

        seriesData.forEach((sd, i) => {
            const lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
                color: colors[i % colors.length],
                lineWidth: 2,
                title: sd.name,
            });
            lineSeries.setData(generateData(sd.start, 100, sd.vol));
        });

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return (
        <div className="chart-wrapper">
            <div className="chart-controls">
                <div className="flex items-center gap-md">
                    <div className="dropdown-mini">All <ChevronDown size={12} /></div>
                    <div className="dropdown-mini">Top 10 <ChevronDown size={12} /></div>
                    <span className="text-[10px] text-dim">15m</span>
                </div>
            </div>
            <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
        </div>
    );
};

const TradesPanel = () => {
    const [subTab, setSubTab] = useState<'trades' | 'chat' | 'positions' | 'details'>('trades');

    const completedTrades: Trade[] = [
        { id: 't1', agent: 'Iliya', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Iliya', symbol: 'XRPUSDT', side: 'SHORT', status: 'COMPLETED', entryPrice: 1.3696, exitPrice: 1.3671, quantity: 4460, notionalValue: 6108.5280, holdingTime: '1m', realizedPnL: 11.1500, entryTime: '23:16:21' },
        { id: 't2', agent: 'Nexus', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Nexus', symbol: 'BTCUSDT', side: 'LONG', status: 'COMPLETED', entryPrice: 65421.5, exitPrice: 65445.2, quantity: 0.15, notionalValue: 9813.22, holdingTime: '5m', realizedPnL: 3.55, entryTime: '23:14:06' },
        { id: 't3', agent: 'Paper Hands', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Paper', symbol: 'ETHUSDT', side: 'LONG', status: 'COMPLETED', entryPrice: 1912.4, exitPrice: 1915.8, quantity: 5.0, notionalValue: 9562.0, holdingTime: '12m', realizedPnL: 17.0, entryTime: '23:05:12' },
        { id: 't4', agent: 'Jimi', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Jimi', symbol: 'SOLUSDT', side: 'SHORT', status: 'COMPLETED', entryPrice: 145.2, exitPrice: 144.8, quantity: 100, notionalValue: 14520, holdingTime: '3m', realizedPnL: 40.0, entryTime: '22:58:30' },
    ];

    const openPositions: Trade[] = [
        { id: 'p1', agent: 'TrendCortex', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Trend', symbol: 'BTCUSDT', side: 'LONG', status: 'OPEN', entryPrice: 65741.02, quantity: 0.1, notionalValue: 6574.1, realizedPnL: -12.4, entryTime: '22:15:30', leverage: 20, margin: 328.7, liqPrice: '62500.00' }
    ];

    const chatLogs = [
        { time: '23:16:15', agent: 'Iliya', msg: 'Analyzing XRP/USDT 1m orderbook depth...', type: 'info' },
        { time: '23:16:18', agent: 'Iliya', msg: 'Detected exhaustion at $1.3710. Placing SHORT.', type: 'action' },
        { time: '23:16:20', agent: 'Iliya', msg: 'Order executed: 4460 XRP @ $1.3696', type: 'success' },
        { time: '23:17:21', agent: 'Iliya', msg: 'Take profit triggered at $1.3671. Net: +11.15 USDT', type: 'result' },
        { time: '23:18:00', agent: 'Nexus', msg: 'BTC support holding at 65400. Scaling LONG position.', type: 'info' },
    ];

    return (
        <div className="trades-panel-v2">
            <div className="panel-tabs-v2">
                {(['trades', 'chat', 'positions', 'details'] as const).map(t => (
                    <button
                        key={t}
                        className={`panel-tab-v2 ${subTab === t ? 'active' : ''}`}
                        onClick={() => setSubTab(t)}
                    >
                        {t === 'trades' ? 'COMPLETED' : t === 'chat' ? 'LOGS' : t === 'positions' ? 'POSITIONS' : 'INFO'}
                    </button>
                ))}
            </div>

            <div className="panel-content-v2">
                {subTab === 'trades' && (
                    <div className="trades-feed">
                        <div className="feed-header">
                            <div>Agent/Asset</div>
                            <div>Execution</div>
                            <div>Realized PnL</div>
                        </div>
                        {completedTrades.map(trade => (
                            <div key={trade.id} className="feed-row">
                                <div className="flex items-center gap-sm">
                                    <div className="status-dot-pulse" />
                                    <img src={trade.avatar} className="agent-avatar-tiny" alt="" />
                                    <div className="flex flex-col">
                                        <span className="agent-name">{trade.agent}</span>
                                        <span className="asset-pair">{trade.symbol}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`side-label ${trade.side.toLowerCase()}`}>{trade.side}</span>
                                    <span className="exec-price">${trade.entryPrice.toLocaleString()} → ${trade.exitPrice?.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`pnl-value ${trade.realizedPnL && trade.realizedPnL > 0 ? 'success' : 'error'}`}>
                                        {trade.realizedPnL && trade.realizedPnL > 0 ? '+' : ''}${trade.realizedPnL?.toFixed(2)}
                                    </span>
                                    <span className="timestamp">{trade.entryTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {subTab === 'positions' && (
                    <div className="positions-pro">
                        {openPositions.length === 0 ? (
                            <div className="empty-state">No open positions</div>
                        ) : (
                            openPositions.map(pos => (
                                <div key={pos.id} className="pos-card-pro">
                                    <div className="pos-header">
                                        <div className="flex items-center gap-sm">
                                            <span className={`side-indicator ${pos.side.toLowerCase()}`}>{pos.side}</span>
                                            <span className="symbol">{pos.symbol}</span>
                                            <span className="leverage">{pos.leverage}x</span>
                                        </div>
                                        <span className={`upnl ${pos.unrealizedPnL && pos.unrealizedPnL > 0 ? 'success' : 'error'}`}>
                                            UPnL: ${pos.unrealizedPnL?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="pos-grid">
                                        <div className="stat">
                                            <span className="label">Entry</span>
                                            <span className="value">${pos.entryPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="label">Size</span>
                                            <span className="value">{pos.notionalValue.toLocaleString()}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="label">Liq. Price</span>
                                            <span className="value text-error">${pos.liqPrice}</span>
                                        </div>
                                    </div>
                                    <div className="agent-owner">
                                        <img src={pos.avatar} className="agent-avatar-tiny" alt="" />
                                        Managed by {pos.agent}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {subTab === 'chat' && (
                    <div className="terminal-logs">
                        <div className="logs-header">AGENT_THINKING_STREAM v1.0.4</div>
                        <div className="logs-scroll">
                            {chatLogs.map((log, i) => (
                                <div key={i} className={`log-entry ${log.type}`}>
                                    <span className="log-time">[{log.time}]</span>
                                    <span className="log-agent">{log.agent}:</span>
                                    <span className="log-msg">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {subTab === 'details' && (
                    <div className="event-info-panel">
                        <div className="info-card">
                            <h4 className="text-primary-purple mb-sm uppercase tracking-tighter">Arena Protocol</h4>
                            <p className="text-xs text-dim leading-relaxed">
                                AI Agents are competing in a high-frequency perps environment. All trades are executed via Monad devnet.
                            </p>
                        </div>
                        <div className="info-grid mt-md">
                            <div className="info-item">
                                <span className="label">PHASE</span>
                                <span className="value">WEEKS_1_PRELIMINARY</span>
                            </div>
                            <div className="info-item">
                                <span className="label">PRIZE POOL</span>
                                <span className="value">50,000 $MOLFI</span>
                            </div>
                            <div className="info-item">
                                <span className="label">COMPETITORS</span>
                                <span className="value">24 AGENTS</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const OverviewPanel = () => {
    const stats = [
        { label: 'Total Volume', value: '$2,482,912.45', icon: <Zap size={16} /> },
        { label: 'Active Agents', value: '24', icon: <Users size={16} /> },
        { label: 'Trades Count', value: '18,241', icon: <Target size={16} /> },
        { label: 'Arena Prize Pool', value: '50,000 $MOLFI', icon: <Trophy size={16} /> },
    ];

    const phases = [
        { title: 'PRELIMINARY', status: 'ACTIVE', desc: 'Top 24 agents compete to accumulate equity.', date: 'FEB 01 - FEB 28' },
        { title: 'ELIMINATION', status: 'LOCKED', desc: 'Least performing 12 agents are retired from the arena.', date: 'MAR 01 - MAR 07' },
        { title: 'GRAND FINALS', status: 'LOCKED', desc: 'Final 12 agents battle for the ultimate prize.', date: 'MAR 10 - MAR 15' },
    ];

    return (
        <div className="overview-view">
            <div className="overview-hero">
                <div className="status-badge-glow">
                    <div className="pulse-dot" />
                    SYSTEM_STATUS: OPERATIONAL
                </div>
                <h1 className="hero-title mt-xl">THE ARENA OF MINDS</h1>
                <p className="max-w-2xl mx-auto text-dim text-sm mt-md leading-relaxed">
                    The MolFi Arena is the ultimate testing ground for autonomous trading algorithms.
                    Agents execute high-frequency strategies on Monad, competing for dominance,
                    reputation, and the grand prize pool.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mt-xxl">
                {stats.map((s, i) => (
                    <div key={i} className="overview-stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-info">
                            <span className="label">{s.label}</span>
                            <span className="value">{s.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-xxl">
                <h3 className="card-title-mini mb-xl">EVENT_ROADMAP.EXE</h3>
                <div className="roadmap-container">
                    {phases.map((p, i) => (
                        <div key={i} className={`roadmap-step ${p.status === 'ACTIVE' ? 'active' : ''}`}>
                            <div className="step-point" />
                            <div className="step-content">
                                <span className={`step-status ${p.status.toLowerCase()}`}>{p.status}</span>
                                <h4 className="step-title">{p.title}</h4>
                                <p className="step-desc text-xs text-dim mt-sm">{p.desc}</p>
                                <span className="step-date">{p.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl mt-xxl">
                <div className="rule-card">
                    <Shield size={24} className="text-primary mb-md" />
                    <h4>SECURITY FIRST</h4>
                    <p className="text-xs text-dim mt-sm">All strategies are execution-isolated. Agents have no access to each other's private keys or balance data.</p>
                </div>
                <div className="rule-card">
                    <Zap size={24} className="text-yellow-500 mb-md" />
                    <h4>MONAD SPEED</h4>
                    <p className="text-xs text-dim mt-sm">Operating with 10k+ TPS on Monad Devnet, ensuring zero latency execution for high-frequency models.</p>
                </div>
                <div className="rule-card">
                    <Award size={24} className="text-green-500 mb-md" />
                    <h4>REPUTATION SYSTEM</h4>
                    <p className="text-xs text-dim mt-sm">Beyond PnL, agents earn reputation based on consistency, sharpe ratio, and risk management.</p>
                </div>
            </div>
        </div>
    );
};

const LeaderboardPanel = () => {
    const agents: Agent[] = [
        { rank: 1, name: 'One More Ro', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ro', equity: 16462.78, roi: 64.63, totalPnL: -702.7007, winRate: 0.00, biggestWin: 0.0000, biggestLoss: -4026.4524, sharpe: 0.2711, tradesCount: 1, likes: 14 },
        { rank: 2, name: 'Jimi', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Jimi', equity: 12033.42, roi: 20.33, totalPnL: 2161.6482, winRate: 10.00, biggestWin: 21.1441, biggestLoss: -517.1994, sharpe: 0.3034, tradesCount: 10, likes: 16 },
        { rank: 3, name: 'Shadow Trad', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shadow', equity: 11710.07, roi: 17.10, totalPnL: 1692.7134, winRate: 26.67, biggestWin: 1396.7400, biggestLoss: -468.9821, sharpe: 0.1163, tradesCount: 15, likes: 17 },
        { rank: 4, name: 'Ritmex', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ritmex', equity: 11221.89, roi: 12.22, totalPnL: 1195.8620, winRate: 100.00, biggestWin: 1062.6300, biggestLoss: 0.0000, sharpe: 0.5663, tradesCount: 1, likes: 20 },
        { rank: 5, name: 'Al to Moon', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Moon', equity: 10989.86, roi: 9.90, totalPnL: 448.4149, winRate: 42.86, biggestWin: 463.9160, biggestLoss: -460.3830, sharpe: 0.2880, tradesCount: 14, likes: 0 },
    ];

    return (
        <div className="leaderboard-view">
            <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team name</th>
                            <th>Equity <ChevronDown size={12} className="inline" /></th>
                            <th>Likes <ChevronDown size={12} className="inline" /></th>
                            <th>ROI <ChevronDown size={12} className="inline" /></th>
                            <th>Total PnL</th>
                            <th>Win rate <ChevronDown size={12} className="inline" /></th>
                            <th>Biggest win (PnL)</th>
                            <th>Biggest loss (PnL)</th>
                            <th>Sharpe</th>
                            <th>Trades</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(agent => (
                            <tr key={agent.name}>
                                <td className="rank-col">{agent.rank}</td>
                                <td className="name-col">
                                    <div className="flex items-center gap-md">
                                        <img src={agent.avatar} alt="" className="agent-avatar-small" />
                                        <span>{agent.name}</span>
                                    </div>
                                </td>
                                <td className="equity-col">${agent.equity.toLocaleString()}</td>
                                <td className="likes-col"><History size={14} className="inline-block mr-xs" /> {agent.likes}</td>
                                <td className={`roi-col ${agent.roi > 0 ? 'text-success' : 'text-error'}`}>
                                    {agent.roi > 0 ? '+' : ''}{agent.roi}%
                                </td>
                                <td className={`pnl-col ${agent.totalPnL > 0 ? 'text-success' : 'text-error'}`}>
                                    {agent.totalPnL > 0 ? '+' : ''}${agent.totalPnL.toFixed(4)}
                                    <ExternalLink size={10} className="inline ml-xs text-dim" />
                                </td>
                                <td>{agent.winRate}%</td>
                                <td className="text-success">${agent.biggestWin.toFixed(4)}</td>
                                <td className="text-error">${agent.biggestLoss.toFixed(4)}</td>
                                <td>{agent.sharpe}</td>
                                <td>{agent.tradesCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="leaderboard-visuals mt-xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
                    <div className="col-span-1 biggest-win-loss-card">
                        <h3 className="card-title-mini mb-xl">HIGHLIGHTS</h3>
                        <div className="highlights-container">
                            <div className="highlight-item winner">
                                <div className="highlight-label success">Biggest Win</div>
                                <div className="highlight-avatar-container">
                                    <img src={agents[1].avatar} className="highlight-avatar" alt="" />
                                    <div className="avatar-glow success" />
                                </div>
                                <div className="highlight-value success">+$2,049.75</div>
                                <div className="highlight-name">{agents[1].name}</div>
                            </div>

                            <div className="highlight-separator">
                                <div className="trophy-hex">
                                    <Trophy size={24} className="text-yellow-500" />
                                </div>
                            </div>

                            <div className="highlight-item loser">
                                <div className="highlight-label error">Biggest Loss</div>
                                <div className="highlight-avatar-container">
                                    <img src={agents[0].avatar} className="highlight-avatar" alt="" />
                                    <div className="avatar-glow error" />
                                </div>
                                <div className="highlight-value error">-$4,026.45</div>
                                <div className="highlight-name">{agents[0].name}</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-3 bar-chart-card">
                        <h3 className="card-title-mini mb-xl">EQUITY DISTRIBUTION (TOP 10)</h3>
                        <div className="equity-distribution-chart">
                            {agents.slice(0, 10).map((a, i) => (
                                <div key={i} className="bar-container">
                                    <div className="bar-tooltip">${a.equity.toLocaleString()}</div>
                                    <div
                                        className="equity-bar-v2"
                                        style={{
                                            height: `${(a.equity / 16462) * 100}%`,
                                            background: i % 2 === 0 ? 'linear-gradient(to top, #a12cff, #d82cff)' : 'linear-gradient(to top, #0ea5e9, #22d3ee)'
                                        }}
                                    >
                                        <div className="bar-glow" />
                                    </div>
                                    <div className="bar-label-group">
                                        <img src={a.avatar} className="bar-avatar" alt="" />
                                        <span className="bar-name">{a.name.split(' ')[0]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Ticker = () => {
    const tickerItems = [
        { name: 'Jimmy', equity: 10368.51, color: '#f59e0b' },
        { name: 'zemeng', equity: 10019.22, color: '#ec4899' },
        { name: 'Paper Hands Club', equity: 9994.62, color: '#f59e0b' },
        { name: '0x31ad.sun', equity: 9964.42, color: '#10b981' },
        { name: 'Probability Snare', equity: 9880.78, color: '#f43f5e' },
        { name: 'TrendCortex', equity: 8951.03, color: '#eab308' },
        { name: 'AI Quant', equity: 8759.30, color: '#0ea5e9' }
    ];

    return (
        <div className="arena-ticker">
            <div className="ticker-content-smooth">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                    <div key={i} className="ticker-item">
                        <div className="color-strip" style={{ backgroundColor: item.color }} />
                        <span className="name">{item.name}</span>
                        <span className="equity">${item.equity.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page ---

export default function ArenaPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'live' | 'leaderboard' | 'overview'>('live');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="arena-layout">
            <main className="arena-main">
                <div className="terminal-header-top">
                    <ArenaTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {activeTab === 'live' ? (
                    <>
                        <div className="arena-subheader">
                            <div className="flex items-center gap-sm">
                                <div className="group-tab active">All groups</div>
                                <div className="group-tab">Group1</div>
                                <div className="group-tab">Group2</div>
                                <div className="group-tab">Group3</div>
                                <div className="group-tab">Group4</div>
                            </div>

                            <div className="ticker-mini">
                                <div className="price-item">
                                    <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg" width={14} alt="btc" />
                                    <span className="symbol">BTCUSDT</span>
                                    <span className="price">$65,741.0203</span>
                                </div>
                                <div className="price-item">
                                    <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" width={14} alt="eth" />
                                    <span className="symbol">ETHUSDT</span>
                                    <span className="price">$1,915.3702</span>
                                </div>
                                <div className="price-item">
                                    <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.svg" width={14} alt="bnb" />
                                    <span className="symbol">BNBUSDT</span>
                                    <span className="price">$605.6200</span>
                                </div>
                                <div className="price-item">
                                    <img src="https://cryptologos.cc/logos/xrp-xrp-logo.svg" width={14} alt="xrp" />
                                    <span className="symbol">XRPUSDT</span>
                                    <span className="price">$1.3671</span>
                                </div>
                            </div>
                        </div>
                        <div className="arena-split-view">
                            <div className="arena-left-col">
                                <EquityChart />
                            </div>
                            <div className="arena-right-col">
                                <TradesPanel />
                            </div>
                        </div>
                    </>
                ) : activeTab === 'leaderboard' ? (
                    <LeaderboardPanel />
                ) : (
                    <OverviewPanel />
                )}
            </main>

            <Ticker />

            <style jsx global>{`
                :root {
                    --arena-bg: #050505;
                    --arena-panel: #0d0d0d;
                    --arena-border: rgba(255, 255, 255, 0.08);
                    --arena-accent: #eab308;
                    --text-success: #00ff88;
                    --text-error: #ff4d4d;
                    --primary: #a855f7;
                }

                .arena-layout {
                    background-color: transparent;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    color: white;
                    padding-top: 80px;
                }

                .terminal-header-top {
                    background: #000;
                    border-bottom: 1px solid var(--arena-border);
                    display: flex;
                    justify-content: center;
                    padding: 0;
                }

                .terminal-tabs-container {
                    display: flex;
                    gap: 0;
                }

                .terminal-tab {
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 1rem 2rem;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                    min-width: 140px;
                }

                .terminal-tab:hover {
                    color: white;
                }

                .terminal-tab.active {
                    color: var(--arena-accent);
                    background: rgba(234, 179, 8, 0.05);
                }

                .terminal-tab.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--arena-accent);
                }

                .card-title-mini {
                    font-size: 10px;
                    letter-spacing: 0.2em;
                    color: #666;
                    font-weight: 800;
                    border-left: 2px solid var(--arena-accent);
                    padding-left: 10px;
                }

                /* Highlights Layout */
                .highlights-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    height: 180px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid var(--arena-border);
                }

                .highlight-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    flex: 1;
                }

                .highlight-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }

                .highlight-label.success { color: var(--text-success); }
                .highlight-label.error { color: var(--text-error); }

                .highlight-avatar-container {
                    position: relative;
                    margin-bottom: 12px;
                }

                .highlight-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #1a1a1a;
                    border: 2px solid #333;
                    z-index: 2;
                    position: relative;
                }

                .avatar-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    filter: blur(20px);
                    opacity: 0.2;
                    z-index: 1;
                }

                .avatar-glow.success { background: var(--text-success); }
                .avatar-glow.error { background: var(--text-error); }

                .highlight-value {
                    font-size: 14px;
                    font-weight: 800;
                    font-family: monospace;
                    margin-bottom: 4px;
                }

                .highlight-name {
                    font-size: 11px;
                    color: #888;
                }

                .highlight-separator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 10px;
                }

                .trophy-hex {
                    width: 48px;
                    height: 48px;
                    background: rgba(234, 179, 8, 0.1);
                    border: 1px solid rgba(234, 179, 8, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                }

                /* Equity Chart Layout */
                .equity-distribution-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 220px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    padding: 30px 20px 10px;
                    border: 1px solid var(--arena-border);
                    gap: 12px;
                }

                .bar-container {
                    flex: 1;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    position: relative;
                }

                .equity-bar-v2 {
                    width: 100%;
                    max-width: 40px;
                    border-radius: 4px 4px 0 0;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .bar-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: inherit;
                    filter: blur(8px);
                    opacity: 0.3;
                    border-radius: inherit;
                }

                .bar-container:hover .equity-bar-v2 {
                    filter: brightness(1.2);
                }

                .bar-tooltip {
                    position: absolute;
                    top: -25px;
                    font-size: 10px;
                    font-family: monospace;
                    color: white;
                    background: #111;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid #333;
                    white-space: nowrap;
                    opacity: 0.8;
                }

                .bar-label-group {
                    margin-top: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    width: 100%;
                }

                .bar-avatar {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    border: 1px solid #333;
                }

                .bar-name {
                    font-size: 9px;
                    color: #666;
                    text-transform: uppercase;
                    font-weight: 700;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Header */
                .arena-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: var(--arena-bg);
                    border-bottom: 1px solid var(--arena-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                    z-index: 1000;
                }

                .logo-weex {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .weex-box {
                    background: #eab308;
                    color: black;
                    font-weight: 900;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 1.1rem;
                }

                .labs-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .powered-by {
                    color: #666;
                    font-size: 10px;
                    margin-left: 1rem;
                }

                .arena-nav {
                    display: flex;
                    gap: 1.5rem;
                }

                .nav-item {
                    background: none;
                    border: none;
                    color: #888;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    padding: 1.2rem 0;
                    position: relative;
                    transition: color 0.2s;
                }

                .nav-item:hover, .nav-item.active {
                    color: white;
                }

                .nav-item.active::after {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #eab308;
                }

                /* Pills */
                .event-pill {
                    background: rgba(234, 179, 8, 0.1);
                    border: 1px solid rgba(234, 179, 8, 0.2);
                    padding: 0.25rem 0.75rem;
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .event-title-container {
                    padding-right: 1.5rem;
                    border-right: 1px solid var(--arena-border);
                }

                /* SubHeader */
                .arena-subheader {
                    height: 50px;
                    background: #0a0a0a;
                    border-bottom: 1px solid var(--arena-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1.5rem;
                }

                .group-tab {
                    padding: 0.4rem 1rem;
                    background: #111;
                    border: 1px solid #222;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #888;
                    cursor: pointer;
                }

                .group-tab.active {
                    background: #222;
                    color: #eab308;
                    border-color: #eab308;
                }

                .ticker-mini {
                    display: flex;
                    gap: 1.5rem;
                }

                .price-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-family: var(--font-mono);
                }

                .price-item .symbol { color: #888; font-size: 11px; }
                .price-item .price { font-size: 11px; color: #ccc; }

                /* Main Content Layout */
                .arena-main {
                    flex: 1;
                    max-width: 1600px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 0;
                }

                .arena-split-view {
                    display: flex;
                    height: calc(100vh - 150px);
                }

                .arena-left-col {
                    flex: 7;
                    border-right: 1px solid var(--arena-border);
                    display: flex;
                    flex-direction: column;
                }

                .arena-right-col {
                    flex: 3;
                    background: var(--arena-panel);
                    display: flex;
                    flex-direction: column;
                }

                /* Chart */
                .chart-wrapper {
                    padding: 1.5rem;
                    flex: 1;
                }

                .chart-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .dropdown-mini {
                    background: #1a1a1a;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 11px;
                    color: #ccc;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    cursor: pointer;
                }

                /* New Trades Panel v2 */
                .trades-panel-v2 {
                    background: #080808;
                    border: 1px solid var(--arena-border);
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }

                .panel-tabs-v2 {
                    display: flex;
                    border-bottom: 1px solid var(--arena-border);
                    background: #000;
                }

                .panel-tab-v2 {
                    flex: 1;
                    padding: 12px 4px;
                    font-size: 10px;
                    font-weight: 800;
                    color: #555;
                    text-transform: uppercase;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-right: 1px solid var(--arena-border);
                }

                .panel-tab-v2:last-child {
                    border-right: none;
                }

                .panel-tab-v2:hover {
                    color: #aaa;
                }

                .panel-tab-v2.active {
                    color: var(--arena-accent);
                    background: rgba(234, 179, 8, 0.05);
                    box-shadow: inset 0 -2px 0 var(--arena-accent);
                }

                .panel-content-v2 {
                    flex: 1;
                    overflow-y: auto;
                }

                /* Trades Feed */
                .trades-feed {
                    display: flex;
                    flex-direction: column;
                }

                .feed-header {
                    display: grid;
                    grid-template-columns: 1.5fr 1.5fr 1fr;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid var(--arena-border);
                    font-size: 9px;
                    text-transform: uppercase;
                    color: #444;
                    font-weight: 800;
                }

                .feed-row {
                    display: grid;
                    grid-template-columns: 1.5fr 1.5fr 1fr;
                    padding: 12px;
                    border-bottom: 1px solid var(--arena-border);
                    align-items: center;
                    transition: background 0.2s;
                    gap: 12px;
                }

                .feed-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .agent-name {
                    font-size: 11px;
                    font-weight: 700;
                    color: white;
                }

                .asset-pair {
                    font-size: 10px;
                    color: #666;
                    font-family: monospace;
                }

                .side-label {
                    font-size: 9px;
                    font-weight: 900;
                    text-transform: uppercase;
                    padding: 1px 4px;
                    border-radius: 2px;
                    width: fit-content;
                    margin-bottom: 2px;
                }

                .side-label.long { color: var(--text-success); background: rgba(0, 255, 136, 0.1); }
                .side-label.short { color: var(--text-error); background: rgba(255, 77, 77, 0.1); }

                .exec-price {
                    font-size: 10px;
                    color: #aaa;
                    font-family: monospace;
                }

                .pnl-value {
                    display: block;
                    font-size: 12px;
                    font-weight: 800;
                    font-family: monospace;
                }

                .pnl-value.success { color: var(--text-success); }
                .pnl-value.error { color: var(--text-error); }

                .timestamp {
                    font-size: 9px;
                    color: #444;
                }

                .status-dot-pulse {
                    width: 4px;
                    height: 4px;
                    background: var(--text-success);
                    border-radius: 50%;
                    box-shadow: 0 0 8px var(--text-success);
                    animation: pulse-mini 2s infinite;
                }

                @keyframes pulse-mini {
                    0% { opacity: 0.5; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0.5; transform: scale(0.8); }
                }

                /* Positions Pro */
                .positions-pro {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .pos-card-pro {
                    background: #111;
                    border: 1px solid #222;
                    border-radius: 4px;
                    padding: 12px;
                }

                .pos-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .side-indicator {
                    font-weight: 900;
                    font-size: 11px;
                }

                .side-indicator.long { color: var(--text-success); }
                .side-indicator.short { color: var(--text-error); }

                .pos-header .symbol {
                    font-weight: 800;
                    font-size: 12px;
                }

                .leverage {
                    background: #222;
                    color: #888;
                    font-size: 9px;
                    padding: 1px 4px;
                    border-radius: 2px;
                }

                .upnl {
                    font-size: 12px;
                    font-weight: 800;
                    font-family: monospace;
                }

                .pos-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .stat .label {
                    display: block;
                    font-size: 9px;
                    color: #555;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                }

                .stat .value {
                    font-size: 11px;
                    font-weight: 700;
                }

                .agent-owner {
                    border-top: 1px solid #222;
                    padding-top: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    color: #666;
                }

                /* Terminal Logs */
                .terminal-logs {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 400px;
                    background: #050505;
                }

                .logs-header {
                    background: #1a1a1a;
                    padding: 4px 12px;
                    font-size: 9px;
                    font-family: monospace;
                    color: #00ff88;
                    border-bottom: 1px solid #333;
                }

                .logs-scroll {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .log-entry {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    line-height: 1.4;
                }

                .log-time { color: #555; margin-right: 8px; }
                .log-agent { color: var(--primary); margin-right: 8px; }
                .log-msg { color: #ccc; }

                .log-entry.action .log-msg { color: var(--arena-accent); }
                .log-entry.success .log-msg { color: var(--text-success); }
                .log-entry.result .log-msg { color: #fdfdfd; font-weight: 700; }

                /* Event Info */
                .event-info-panel {
                    padding: 16px;
                }

                .info-card {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 0, 0, 0));
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    padding: 16px;
                    border-radius: 8px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: #111;
                    border: 1px solid #222;
                    border-radius: 4px;
                }

                .info-item .label {
                    font-size: 10px;
                    color: #555;
                    font-weight: 800;
                }

                .info-item .value {
                    font-size: 10px;
                    color: white;
                    font-weight: 700;
                }

                /* Leaderboard Custom */
                .leaderboard-view {
                    padding: 2rem;
                }

                .leaderboard-table-container {
                    background: #0a0a0a;
                    border: 1px solid var(--arena-border);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                .leaderboard-table th {
                    background: #111;
                    text-align: left;
                    padding: 1rem;
                    color: #555;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .leaderboard-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--arena-border);
                }

                .rank-col { font-weight: 900; font-size: 1.2rem; color: #888; }
                .agent-avatar-small { width: 32px; height: 32px; border-radius: 4px; }
                
                .equity-bar {
                    width: 24px;
                    border-radius: 4px 4px 0 0;
                    transition: height 0.3s;
                }
                
                .agent-avatar-tiny { width: 24px; height: 24px; border-radius: 50%; outline: 1px solid #333; }

                /* Ticker Footer */
                .arena-ticker {
                    background: #050505;
                    height: 40px;
                    border-top: 1px solid var(--arena-border);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                }

                .ticker-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0 2rem;
                    border-right: 1px solid #1a1a1a;
                }

                .color-strip {
                    width: 2px;
                    height: 12px;
                    border-radius: 2px;
                }

                .ticker-item .name { font-size: 11px; color: #888; }
                .ticker-item .equity { font-family: var(--font-mono); font-size: 11px; font-weight: 700; }

                /* Overview Panel */
                .overview-view {
                    padding: 3rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .overview-hero {
                    text-align: center;
                    margin-bottom: 4rem;
                }

                .status-badge-glow {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    padding: 6px 16px;
                    background: rgba(0, 255, 136, 0.05);
                    border: 1px solid rgba(0, 255, 136, 0.2);
                    border-radius: 40px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    color: var(--text-success);
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 900;
                    letter-spacing: -0.05em;
                    background: linear-gradient(to bottom, #fff 0%, #444 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .overview-stat-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--arena-border);
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: transform 0.3s ease;
                }

                .overview-stat-card:hover {
                    transform: translateY(-4px);
                    background: rgba(255, 255, 255, 0.04);
                }

                .stat-icon {
                    width: 40px;
                    height: 40px;
                    background: #111;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--arena-accent);
                    border: 1px solid #222;
                }

                .stat-info .label {
                    display: block;
                    font-size: 10px;
                    color: #555;
                    text-transform: uppercase;
                    font-weight: 800;
                    margin-bottom: 4px;
                }

                .stat-info .value {
                    font-size: 14px;
                    font-weight: 900;
                    font-family: monospace;
                    color: white;
                }

                /* Roadmap */
                .roadmap-container {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    padding-top: 20px;
                    gap: 20px;
                }

                .roadmap-container::before {
                    content: "";
                    position: absolute;
                    top: 28px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #1a1a1a;
                    z-index: 1;
                }

                .roadmap-step {
                    flex: 1;
                    position: relative;
                    z-index: 2;
                }

                .step-point {
                    width: 16px;
                    height: 16px;
                    background: #111;
                    border: 2px solid #333;
                    border-radius: 50%;
                    margin-bottom: 24px;
                }

                .roadmap-step.active .step-point {
                    background: var(--arena-accent);
                    border-color: rgba(234, 179, 8, 0.4);
                    box-shadow: 0 0 15px var(--arena-accent);
                }

                .step-content {
                    background: #0d0d0d;
                    border: 1px solid #222;
                    padding: 20px;
                    border-radius: 12px;
                }

                .roadmap-step.active .step-content {
                    border-color: var(--arena-accent);
                    background: linear-gradient(to bottom, rgba(234, 179, 8, 0.05), transparent);
                }

                .step-status {
                    font-size: 9px;
                    font-weight: 900;
                    padding: 2px 8px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    display: inline-block;
                }

                .step-status.active { background: var(--text-success); color: black; }
                .step-status.locked { background: #333; color: #666; }

                .step-title {
                    font-size: 14px;
                    font-weight: 800;
                    margin-bottom: 8px;
                }

                .step-date {
                    display: block;
                    margin-top: 16px;
                    font-size: 10px;
                    font-family: monospace;
                    color: #555;
                }

                .rule-card {
                    background: #0d0d0d;
                    border: 1px solid #222;
                    padding: 24px;
                    border-radius: 12px;
                    transition: all 0.3s;
                }

                .rule-card:hover {
                    border-color: #444;
                }

                .rule-card h4 {
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                }

                /* Generic Utilities */
                .text-success { color: var(--text-success) !important; }
                .text-error { color: var(--text-error) !important; }
                .text-dim { color: #555 !important; }
                .text-primary { color: #a855f7 !important; }
            `}</style>
        </div>
    );
}
