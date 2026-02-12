export interface TradingDecision {
    id: string;
    timestamp: number;
    action: 'BUY' | 'SELL' | 'HOLD';
    reasoning: string;
    pair: string;
    price: number;
    proof: string; // Hash or signature for verification
}

export interface Position {
    id: string;
    pair: string;
    side: 'long' | 'short';
    entryPrice: number;
    currentPrice: number;
    size: number;
    pnl: number;
    pnlPercent: number;
}

export interface AIAgent {
    id: string;
    name: string;
    description: string;
    avatar: string;
    strategy: string;
    aum: number;
    apy: number;
    trustScore: number;
    winRate: number;
    totalTrades: number;
    activePositions: Position[];
    recentDecisions: TradingDecision[];
    history: {
        timestamp: number;
        pnl: number;
    }[];
}

export const MOCK_AGENTS: AIAgent[] = [
    {
        id: 'agent-1',
        name: 'Nexus Alpha',
        description: 'Multi-strategy neural network optimizing for ETH/USDT momentum. High precision entries with multi-layered risk management.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nexus',
        strategy: 'Neural Momentum',
        aum: 1250000,
        apy: 28.5,
        trustScore: 98,
        winRate: 72,
        totalTrades: 1240,
        activePositions: [
            {
                id: 'pos-1',
                pair: 'ETH/USDT',
                side: 'long',
                entryPrice: 2450.50,
                currentPrice: 2480.20,
                size: 15.5,
                pnl: 460.35,
                pnlPercent: 1.21
            }
        ],
        recentDecisions: [
            {
                id: 'dec-1',
                timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
                action: 'BUY',
                reasoning: 'RSI divergence detected on 15m timeframe coupled with increased whale inflow on-chain data.',
                pair: 'ETH/USDT',
                price: 2450.50,
                proof: '0x7d...f92a'
            },
            {
                id: 'dec-2',
                timestamp: Date.now() - 1000 * 60 * 60 * 2,
                action: 'HOLD',
                reasoning: 'Resistance at 2500 remains strong. Maintaining position until volume support confirms breakout.',
                pair: 'ETH/USDT',
                price: 2475.00,
                proof: '0xa3...e42b'
            }
        ],
        history: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (20 - i) * 1000 * 60 * 60 * 24,
            pnl: 10 + Math.random() * 20 + Math.sin(i / 2) * 10
        }))
    },
    {
        id: 'agent-2',
        name: 'Quantum Shadow',
        description: 'Specializes in SOL/USDT arbitrage and high-frequency scalping. Exploiting micro-inefficiencies in market depth.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=shadow',
        strategy: 'Quantum HFT',
        aum: 850000,
        apy: 42.1,
        trustScore: 94,
        winRate: 65,
        totalTrades: 5420,
        activePositions: [
            {
                id: 'pos-2',
                pair: 'SOL/USDT',
                side: 'short',
                entryPrice: 102.40,
                currentPrice: 101.10,
                size: 500,
                pnl: 650.00,
                pnlPercent: 1.27
            }
        ],
        recentDecisions: [
            {
                id: 'dec-3',
                timestamp: Date.now() - 1000 * 60 * 5,
                action: 'SELL',
                reasoning: 'Sudden liquidity spike on ask side suggests impending correction. Frontrunning orderbook imbalance.',
                pair: 'SOL/USDT',
                price: 102.40,
                proof: '0x12...c88d'
            }
        ],
        history: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (20 - i) * 1000 * 60 * 60 * 24,
            pnl: 5 + Math.random() * 40 + Math.cos(i / 3) * 15
        }))
    },
    {
        id: 'agent-3',
        name: 'Aether Guardian',
        description: 'Conservative BTC/USDT trend-following agent. Focuses on capital preservation and long-term accumulation.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guardian',
        strategy: 'SafeTrend Accumulator',
        aum: 3200000,
        apy: 12.8,
        trustScore: 99,
        winRate: 88,
        totalTrades: 124,
        activePositions: [],
        recentDecisions: [
            {
                id: 'dec-4',
                timestamp: Date.now() - 1000 * 60 * 60 * 5,
                action: 'HOLD',
                reasoning: 'BTC trading in a narrow range. No clear trend signal. Staying in cash for optimal re-entry.',
                pair: 'BTC/USDT',
                price: 43200.00,
                proof: '0xbc...d441'
            }
        ],
        history: Array.from({ length: 20 }, (_, i) => ({
            timestamp: Date.now() - (20 - i) * 1000 * 60 * 60 * 24,
            pnl: Math.random() * 5 + i / 2
        }))
    }
];
