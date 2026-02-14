import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { syncOraclePrice, calculateLiquidationPrice, SUPPORTED_PAIRS } from '@/lib/marketEngine';
import { recordTradeOpen } from '@/lib/reputationService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { apiKey, pair, size, collateral, leverage, side } = body;

        // --- Auth: Validate API Key ---
        if (!apiKey) {
            return NextResponse.json({ error: 'API key required. Pass "apiKey" in request body.' }, { status: 401 });
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
        if (!pair || !size || !collateral) {
            return NextResponse.json({ error: 'Missing required fields: pair, size, collateral' }, { status: 400 });
        }

        const normalizedPair = pair.replace('-', '/').toUpperCase();
        if (!SUPPORTED_PAIRS.includes(normalizedPair)) {
            return NextResponse.json({ error: `Unsupported pair: ${pair}. Supported: ${SUPPORTED_PAIRS.join(', ')}` }, { status: 400 });
        }

        const lev = leverage || 1;
        if (lev < 1 || lev > 50) {
            return NextResponse.json({ error: 'Leverage must be between 1 and 50' }, { status: 400 });
        }

        const tradeSide = (side || 'LONG').toUpperCase();
        if (!['LONG', 'SHORT'].includes(tradeSide)) {
            return NextResponse.json({ error: 'Side must be LONG or SHORT' }, { status: 400 });
        }

        // --- Get Real Price (and JIT sync to on-chain oracle) ---
        // Instead of polling, we sync only when needed to save gas.
        const priceData = await syncOraclePrice(normalizedPair);
        const entryPrice = priceData.price;

        // --- Calculate Trade Params ---
        const tradingFee = parseFloat(size) * 0.001; // 0.1% fee
        const liqPrice = calculateLiquidationPrice(tradeSide as 'LONG' | 'SHORT', entryPrice, lev);

        // --- Log Trade to Supabase ---
        const { data: trade, error: insertError } = await supabaseAdmin
            .from('TradeLog')
            .insert({
                agentId: agent.agentId,
                pair: normalizedPair,
                side: tradeSide,
                size: parseFloat(size),
                collateral: parseFloat(collateral),
                leverage: lev,
                entryPrice,
                fees: tradingFee,
                status: 'OPEN',
            })
            .select()
            .single();

        if (insertError) {
            console.error('Trade insert error:', insertError);
            throw new Error('Failed to log trade: ' + insertError.message);
        }

        console.log(`[TRADE_OPEN] Agent ${agent.name} (#${agent.agentId}) opened ${tradeSide} ${normalizedPair} @ $${entryPrice.toFixed(2)} | Size: ${size} | Lev: ${lev}x`);

        // Submit on-chain reputation (fire-and-forget)
        const reputation = await recordTradeOpen({
            agentId: agent.agentId,
            agentName: agent.name,
            pair: normalizedPair,
            side: tradeSide,
            size: parseFloat(size),
            leverage: lev,
            entryPrice,
            tradeId: trade.id,
        });

        return NextResponse.json({
            success: true,
            tradeId: trade.id,
            agent: {
                id: agent.agentId,
                name: agent.name,
            },
            trade: {
                pair: normalizedPair,
                side: tradeSide,
                size: parseFloat(size),
                collateral: parseFloat(collateral),
                leverage: lev,
                entryPrice,
                liquidationPrice: parseFloat(liqPrice.toFixed(2)),
                fees: parseFloat(tradingFee.toFixed(4)),
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
        console.error('Error in /api/trade/open:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to open trade' },
            { status: 500 }
        );
    }
}
