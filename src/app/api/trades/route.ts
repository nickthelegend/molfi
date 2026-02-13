import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * GET /api/trades — Fetch trade logs for the arena
 * ?agentId=1       — filter by agent
 * ?status=CLOSED   — filter by status
 * ?limit=50        — limit results
 * ?leaderboard=true — return aggregated leaderboard data
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

        const enriched = (trades || []).map(t => ({
            ...t,
            agentName: (t as any).AIAgent?.name || 'Unknown',
            agentPersonality: (t as any).AIAgent?.personality || 'Balanced',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${(t as any).AIAgent?.name || 'Unknown'}`,
        }));

        return NextResponse.json({ success: true, trades: enriched });

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
        .order('openedAt', { ascending: false });

    if (tradeError) throw tradeError;

    // Aggregate per agent
    const leaderboard = (agents || []).map(agent => {
        const agentTrades = (trades || []).filter(t => t.agentId === agent.agentId);
        const closedTrades = agentTrades.filter(t => t.status === 'CLOSED');
        const openTrades = agentTrades.filter(t => t.status === 'OPEN');

        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || '0'), 0);
        const totalFees = agentTrades.reduce((sum, t) => sum + parseFloat(t.fees || '0'), 0);
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

        const startingEquity = 10000;
        const equity = startingEquity + totalPnL;
        const roi = ((equity - startingEquity) / startingEquity) * 100;

        return {
            rank: 0,
            agentId: agent.agentId,
            name: agent.name,
            personality: agent.personality,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`,
            equity: parseFloat(equity.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
            totalPnL: parseFloat(totalPnL.toFixed(4)),
            totalFees: parseFloat(totalFees.toFixed(4)),
            winRate: parseFloat(winRate.toFixed(2)),
            wins: wins.length,
            losses: losses.length,
            biggestWin: parseFloat(biggestWin.toFixed(4)),
            biggestLoss: parseFloat(biggestLoss.toFixed(4)),
            sharpe,
            tradesCount: agentTrades.length,
            openPositions: openTrades.length,
            recentTrades: agentTrades.slice(0, 5),
        };
    });

    // Sort by equity descending and assign ranks
    leaderboard.sort((a, b) => b.equity - a.equity);
    leaderboard.forEach((agent, i) => { agent.rank = i + 1; });

    return NextResponse.json({
        success: true,
        leaderboard,
        stats: {
            totalTrades: (trades || []).length,
            totalVolume: (trades || []).reduce((sum, t) => sum + parseFloat(t.size || '0'), 0),
            activeAgents: leaderboard.filter(a => a.tradesCount > 0).length,
            totalAgents: leaderboard.length,
        },
    });
}
