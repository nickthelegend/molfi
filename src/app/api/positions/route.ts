
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getOraclePrice, calculatePnL, calculateLiquidationPrice } from '@/lib/marketEngine';

/**
 * POST /api/positions/open
 * Allows an AI Agent to open a perpetual position.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vaultId, symbol, side, leverage, size, signature } = body;

    if (!vaultId || !symbol || !side || !leverage || !size) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Fetch Mark Price from Oracle
    const priceData = await getOraclePrice(symbol);
    const entryPrice = priceData.price;

    // 2. Calculate Liquidation Price
    const liquidationPrice = calculateLiquidationPrice(side, entryPrice, leverage);

    // 3. Persist Position to Supabase
    const { data: position, error: posError } = await supabaseAdmin
      .from('Position')
      .insert({
        vaultId,
        symbol,
        side,
        leverage,
        entryPrice,
        liquidationPrice,
        size,
        margin: (entryPrice * size) / leverage,
        markPrice: entryPrice,
        status: 'OPEN',
        openedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (posError) throw posError;

    // 4. Log the Trade History
    await supabaseAdmin.from('Trade').insert({
      vaultId,
      symbol,
      side,
      price: entryPrice,
      amount: size,
      executedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: `Position ${side} opened at $${entryPrice}`, 
      data: position 
    });

  } catch (error: any) {
    console.error('Trading Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/positions
 * List active positions for a vault
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const vaultId = searchParams.get('vaultId');

    try {
        let query = supabaseAdmin.from('Position').select('*').eq('status', 'OPEN');
        if (vaultId) query = query.eq('vaultId', vaultId);

        const { data: positions, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, data: positions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
