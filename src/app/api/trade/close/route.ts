import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { syncOraclePrice, calculatePnL } from '@/lib/marketEngine';
import { recordTradeClose } from '@/lib/reputationService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { apiKey, tradeId } = body;

        // --- Auth: Validate API Key ---
        if (!apiKey) {
            return NextResponse.json({ error: 'API key required' }, { status: 401 });
        }

        const { data: agent, error: authError } = await supabaseAdmin
            .from('AIAgent')
            .select('*')
            .eq('apiKey', apiKey)
            .single();

        if (authError || !agent) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        // --- Validation ---
        if (!tradeId) {
            return NextResponse.json({ error: 'tradeId is required' }, { status: 400 });
        }

        // --- Get the open trade ---
        const { data: trade, error: fetchError } = await supabaseAdmin
            .from('TradeLog')
            .select('*')
            .eq('id', tradeId)
            .eq('agentId', agent.agentId)
            .single();

        if (fetchError || !trade) {
            return NextResponse.json({ error: 'Trade not found or does not belong to this agent' }, { status: 404 });
        }

        if (trade.status !== 'OPEN') {
            return NextResponse.json({ error: `Trade is already ${trade.status}` }, { status: 400 });
        }

        // --- Get Current Price (JIT sync to oracle) ---
        const priceData = await syncOraclePrice(trade.pair);
        const exitPrice = priceData.price;

        // --- Calculate PnL ---
        const pnl = calculatePnL(
            trade.side as 'LONG' | 'SHORT',
            parseFloat(trade.entryPrice),
            exitPrice,
            parseFloat(trade.size)
        );

        const closingFee = parseFloat(trade.size) * 0.001; // 0.1%
        const netPnl = pnl - closingFee - parseFloat(trade.fees || '0');

        // --- Update Trade in Supabase ---
        const { data: closedTrade, error: updateError } = await supabaseAdmin
            .from('TradeLog')
            .update({
                exitPrice,
                pnl: parseFloat(netPnl.toFixed(4)),
                fees: parseFloat(trade.fees || '0') + closingFee,
                status: 'CLOSED',
                closedAt: new Date().toISOString(),
            })
            .eq('id', tradeId)
            .select()
            .single();

        if (updateError) {
            throw new Error('Failed to close trade: ' + updateError.message);
        }

        const tradeDuration = Date.now() - new Date(trade.openedAt).getTime();
        console.log(`[TRADE_CLOSE] Agent ${agent.name} (#${agent.agentId}) closed ${trade.side} ${trade.pair} | Entry: $${trade.entryPrice} → Exit: $${exitPrice.toFixed(2)} | PnL: ${netPnl > 0 ? '+' : ''}$${netPnl.toFixed(4)}`);

        // Submit on-chain reputation with PnL as the value
        const reputation = await recordTradeClose({
            agentId: agent.agentId,
            agentName: agent.name,
            pair: trade.pair,
            side: trade.side,
            entryPrice: parseFloat(trade.entryPrice),
            exitPrice,
            pnl: parseFloat(netPnl.toFixed(4)),
            tradeId: trade.id,
            duration: tradeDuration,
        });

        return NextResponse.json({
            success: true,
            agent: {
                id: agent.agentId,
                name: agent.name,
            },
            trade: {
                tradeId: trade.id,
                pair: trade.pair,
                side: trade.side,
                entryPrice: parseFloat(trade.entryPrice),
                exitPrice,
                pnl: parseFloat(netPnl.toFixed(4)),
                totalFees: parseFloat(trade.fees || '0') + closingFee,
                status: 'CLOSED',
                duration: tradeDuration,
                priceSource: priceData.source,
            },
            proof: {
                hash: reputation.proofHash,
                txHash: reputation.txHash || null,
                onChain: reputation.success,
            },
            timestamp: Date.now(),
        });

    } catch (error: any) {
        console.error('Error in /api/trade/close:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to close trade' },
            { status: 500 }
        );
    }
}
