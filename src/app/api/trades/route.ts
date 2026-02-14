import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getOraclePrice, calculatePnL } from '@/lib/marketEngine';

/**
 * GET /api/trades — Fetch trade logs for the arena
 * ?agentId=1       — filter by agent
 * ?status=CLOSED   — filter by status
 * ?limit=50        — limit results
 * ?leaderboard=true — return aggregated leaderboard data with unrealized PnL
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const agentId = searchParams.get('agentId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');
        const leaderboard = searchParams.get('leaderboard');

        // --- Leaderboard Mode ---
        if (leaderboard === 'true') {
            return getLeaderboard();
        }

        // --- Trade Log Mode ---
        let query = supabaseAdmin
            .from('TradeLog')
            .select('*, AIAgent!inner(name, personality)')
            .order('openedAt', { ascending: false })
            .limit(limit);

        if (agentId) query = query.eq('agentId', parseInt(agentId));
        if (status) query = query.eq('status', status);

        const { data: trades, error } = await query;
        if (error) throw error;

        // Fetch current prices for open positions to calculate unrealized PnL
        const openTrades = (trades || []).filter(t => t.status === 'OPEN');
        const uniquePairs = [...new Set(openTrades.map(t => t.pair))];
        const livePrices: Record<string, number> = {};

        await Promise.allSettled(
            uniquePairs.map(async (pair) => {
                try {
                    const pd = await getOraclePrice(pair);
                    livePrices[pair] = pd.price;
                } catch { /* skip */ }
            })
        );

        const enriched = (trades || []).map(t => {
            const agentName = (t as any).AIAgent?.name || 'Unknown';
            let unrealizedPnl: number | null = null;
            let currentPrice: number | null = null;
            let pnlPercent: number | null = null;

            if (t.status === 'OPEN' && livePrices[t.pair]) {
                currentPrice = livePrices[t.pair];
                unrealizedPnl = calculatePnL(
                    t.side as 'LONG' | 'SHORT',
                    parseFloat(t.entryPrice),
                    currentPrice,
                    parseFloat(t.size)
                );
                pnlPercent = (unrealizedPnl / parseFloat(t.collateral || t.size)) * 100;
            }

            return {
                ...t,
                agentName,
                agentPersonality: (t as any).AIAgent?.personality || 'Balanced',
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agentName}`,
                currentPrice,
                unrealizedPnl: unrealizedPnl !== null ? parseFloat(unrealizedPnl.toFixed(4)) : null,
                pnlPercent: pnlPercent !== null ? parseFloat(pnlPercent.toFixed(2)) : null,
            };
        });

        return NextResponse.json({ success: true, trades: enriched, livePrices });

    } catch (error: any) {
        console.error('Error fetching trades:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function getLeaderboard() {
    // Get all agents with their trades
    const { data: agents, error: agentError } = await supabaseAdmin
        .from('AIAgent')
        .select('agentId, name, personality');

    if (agentError) throw agentError;

    const { data: trades, error: tradeError } = await supabaseAdmin
        .from('TradeLog')
        .select('*')
        .order('openedAt', { ascending: true });

    if (tradeError) throw tradeError;

    // Fetch live prices for all open positions
    const openTrades = (trades || []).filter(t => t.status === 'OPEN');
    const uniquePairs = [...new Set(openTrades.map(t => t.pair))];
    const livePrices: Record<string, number> = {};

    await Promise.allSettled(
        uniquePairs.map(async (pair) => {
            try {
                const pd = await getOraclePrice(pair);
                livePrices[pair] = pd.price;
            } catch { /* skip */ }
        })
    );

    // Aggregate per agent
    const leaderboard = (agents || []).map(agent => {
        const agentTrades = (trades || []).filter(t => t.agentId === agent.agentId);
        const closedTrades = agentTrades.filter(t => t.status === 'CLOSED');
        const agentOpenTrades = agentTrades.filter(t => t.status === 'OPEN');

        // ── Realized PnL (closed trades) ──
        const realizedPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || '0'), 0);
        const totalFees = agentTrades.reduce((sum, t) => sum + parseFloat(t.fees || '0'), 0);

        // ── Unrealized PnL (open positions with live prices) ──
        let unrealizedPnL = 0;
        const openPositionsWithPnl = agentOpenTrades.map(t => {
            const currentPrice = livePrices[t.pair];
            if (!currentPrice) return { ...t, unrealizedPnl: 0, currentPrice: null };

            const uPnl = calculatePnL(
                t.side as 'LONG' | 'SHORT',
                parseFloat(t.entryPrice),
                currentPrice,
                parseFloat(t.size)
            );
            unrealizedPnL += uPnl;
            return { ...t, unrealizedPnl: parseFloat(uPnl.toFixed(4)), currentPrice };
        });

        // ── Win/Loss Stats (closed only) ──
        const wins = closedTrades.filter(t => parseFloat(t.pnl || '0') > 0);
        const losses = closedTrades.filter(t => parseFloat(t.pnl || '0') <= 0);
        const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;

        const pnls = closedTrades.map(t => parseFloat(t.pnl || '0'));
        const biggestWin = pnls.length > 0 ? Math.max(...pnls, 0) : 0;
        const biggestLoss = pnls.length > 0 ? Math.min(...pnls, 0) : 0;

        // Sharpe ratio approximation
        const avgPnl = pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0;
        const stdDev = pnls.length > 1
            ? Math.sqrt(pnls.reduce((sum, p) => sum + Math.pow(p - avgPnl, 2), 0) / (pnls.length - 1))
            : 1;
        const sharpe = stdDev > 0 ? parseFloat((avgPnl / stdDev).toFixed(4)) : 0;

        // ── Equity = Starting + Realized + Unrealized ──
        const startingEquity = 10000;
        const totalPnL = realizedPnL + unrealizedPnL;
        const equity = startingEquity + totalPnL;
        const roi = ((equity - startingEquity) / startingEquity) * 100;

        // ── Build REAL equity curve from trade history ──
        const equityCurve: { time: number; value: number }[] = [];
        let runningEquity = startingEquity;

        // Add starting point
        if (agentTrades.length > 0) {
            const firstTradeTime = new Date(agentTrades[0].openedAt).getTime() / 1000;
            equityCurve.push({ time: firstTradeTime - 60, value: runningEquity });
        }

        // Walk through trade events chronologically
        for (const t of agentTrades) {
            if (t.status === 'CLOSED' && t.pnl != null) {
                runningEquity += parseFloat(t.pnl);
                const closeTime = new Date(t.closedAt || t.openedAt).getTime() / 1000;
                equityCurve.push({ time: closeTime, value: parseFloat(runningEquity.toFixed(2)) });
            }
        }

        // Add current point with unrealized PnL
        const now = Date.now() / 1000;
        const currentEquity = runningEquity + unrealizedPnL;
        equityCurve.push({ time: now, value: parseFloat(currentEquity.toFixed(2)) });

        // Enrich recent trades with live PnL data
        const recentTrades = agentTrades.slice(-5).reverse().map(t => {
            const currentPrice = livePrices[t.pair];
            let unrealizedPnl: number | null = null;
            if (t.status === 'OPEN' && currentPrice) {
                unrealizedPnl = parseFloat(calculatePnL(
                    t.side as 'LONG' | 'SHORT',
                    parseFloat(t.entryPrice),
                    currentPrice,
                    parseFloat(t.size)
                ).toFixed(4));
            }
            return {
                ...t,
                agentName: agent.name,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`,
                currentPrice: currentPrice || null,
                unrealizedPnl,
            };
        });

        return {
            rank: 0,
            agentId: agent.agentId,
            name: agent.name,
            personality: agent.personality,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`,
            equity: parseFloat(equity.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
            totalPnL: parseFloat(totalPnL.toFixed(4)),
            realizedPnL: parseFloat(realizedPnL.toFixed(4)),
            unrealizedPnL: parseFloat(unrealizedPnL.toFixed(4)),
            totalFees: parseFloat(totalFees.toFixed(4)),
            winRate: parseFloat(winRate.toFixed(2)),
            wins: wins.length,
            losses: losses.length,
            biggestWin: parseFloat(biggestWin.toFixed(4)),
            biggestLoss: parseFloat(biggestLoss.toFixed(4)),
            sharpe,
            tradesCount: agentTrades.length,
            openPositions: agentOpenTrades.length,
            recentTrades,
            equityCurve,
        };
    });

    // Sort by equity descending and assign ranks
    leaderboard.sort((a, b) => b.equity - a.equity);
    leaderboard.forEach((agent, i) => { agent.rank = i + 1; });

    return NextResponse.json({
        success: true,
        leaderboard,
        livePrices,
        stats: {
            totalTrades: (trades || []).length,
            totalVolume: (trades || []).reduce((sum, t) => sum + parseFloat(t.size || '0'), 0),
            activeAgents: leaderboard.filter(a => a.tradesCount > 0).length,
            totalAgents: leaderboard.length,
        },
    });
}
