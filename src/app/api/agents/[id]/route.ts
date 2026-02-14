import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getOraclePrice, calculatePnL } from '@/lib/marketEngine';

export async function GET(req: Request, { params }: { params: any }) {
    try {
        const { id } = await params;

        // Try to find by integer agentId first, then by UUID id
        let query = supabaseAdmin.from('AIAgent').select('*');
        if (!isNaN(parseInt(id))) {
            query = query.eq('agentId', parseInt(id));
        } else {
            query = query.eq('id', id);
        }

        const { data: agent, error } = await query.single();
        if (error || !agent) {
            return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
        }

        // Fetch ALL trades for this agent to compute stats
        const { data: allTrades } = await supabaseAdmin
            .from('TradeLog')
            .select('*')
            .eq('agentId', agent.agentId)
            .order('openedAt', { ascending: true });

        const trades = allTrades || [];
        const closedTrades = trades.filter(t => t.status === 'CLOSED');
        const openTrades = trades.filter(t => t.status === 'OPEN');

        // Get live prices for open positions
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

        // Realized PnL
        const realizedPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || '0'), 0);

        // Unrealized PnL
        let unrealizedPnL = 0;
        const activePositions = openTrades.map(t => {
            const currentPrice = livePrices[t.pair];
            let uPnl = 0;
            if (currentPrice) {
                uPnl = calculatePnL(t.side as 'LONG' | 'SHORT', parseFloat(t.entryPrice), currentPrice, parseFloat(t.size));
                unrealizedPnL += uPnl;
            }
            return {
                ...t,
                currentPrice,
                unrealizedPnl: parseFloat(uPnl.toFixed(4)),
                unrealizedPnlPercent: parseFloat(((uPnl / parseFloat(t.size)) * 100).toFixed(2))
            };
        });

        const totalPnL = realizedPnL + unrealizedPnL;
        const startingEquity = 10000;
        const currentEquityValue = startingEquity + totalPnL;
        const roi = ((currentEquityValue - startingEquity) / startingEquity) * 100;

        // Build REAL equity curve
        let runningEquity = startingEquity;
        const equityCurve = [{ time: Math.floor(new Date(agent.createdAt).getTime() / 1000), value: runningEquity }];
        closedTrades.forEach(t => {
            runningEquity += parseFloat(t.pnl || '0');
            equityCurve.push({
                time: Math.floor(new Date(t.closedAt || t.openedAt).getTime() / 1000),
                value: parseFloat(runningEquity.toFixed(2))
            });
        });

        // Add current point if there are open positions or time has passed
        if (openTrades.length > 0 || equityCurve.length === 1) {
            equityCurve.push({
                time: Math.floor(Date.now() / 1000),
                value: parseFloat(currentEquityValue.toFixed(2))
            });
        }

        // Fetch recent signals
        const { data: signals } = await supabaseAdmin
            .from('TradeSignal')
            .select('*')
            .eq('agentId', agent.agentId)
            .order('createdAt', { ascending: false })
            .limit(10);

        return NextResponse.json({
            success: true,
            agent: {
                ...agent,
                id: String(agent.agentId),
                owner: agent.ownerAddress,
                equityCurve,
                totalPnL: parseFloat(totalPnL.toFixed(4)),
                realizedPnL: parseFloat(realizedPnL.toFixed(4)),
                unrealizedPnL: parseFloat(unrealizedPnL.toFixed(4)),
                roi: parseFloat(roi.toFixed(2)),
                winRate: closedTrades.length > 0 ? Math.round((closedTrades.filter(t => parseFloat(t.pnl || '0') > 0).length / closedTrades.length) * 100) : 0,
                totalTrades: trades.length,
                activePositions,
                completedPositions: closedTrades.map(t => ({
                    ...t,
                    pnl: parseFloat(parseFloat(t.pnl || '0').toFixed(4)),
                    pnlPercent: t.size && parseFloat(t.size) > 0 ? parseFloat(((parseFloat(t.pnl || '0') / parseFloat(t.size)) * 100).toFixed(2)) : 0
                })).reverse(),
                recentDecisions: signals || []
            }
        });
    } catch (error: any) {
        console.error('Error fetching agent detail:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
