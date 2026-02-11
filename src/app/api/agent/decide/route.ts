
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getOraclePrice } from '@/lib/marketEngine';

/**
 * POST /api/agent/decide
 * Mocking the AI decision process for the hackathon.
 * In production, this would send the prompt + market data to an LLM.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { managerId } = body;

    if (!managerId) return NextResponse.json({ error: 'Missing managerId' }, { status: 400 });

    // 1. Fetch Manager Info
    const { data: manager, error: mError } = await supabaseAdmin
      .from('FundManager')
      .select('*, vault:Vault(*)')
      .eq('id', managerId)
      .single();

    if (mError || !manager) throw new Error('Manager not found');

    // 2. Fetch Market Data
    const market = await getOraclePrice('BTC-USD');

    // 3. AI Logic Simulation (Simplified)
    // Here we simulate a decision based on risk level
    const random = Math.random();
    let action: 'OPEN' | 'HOLD' = 'HOLD';
    let side: 'LONG' | 'SHORT' = 'LONG';
    let leverage = 1.0;

    if (manager.riskLevel === 'DEGENERATE') {
        if (random > 0.3) action = 'OPEN';
        side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        leverage = 25.0;
    } else if (manager.riskLevel === 'AGGRESSIVE') {
        if (random > 0.6) action = 'OPEN';
        side = 'LONG';
        leverage = 10.0;
    } else {
        if (random > 0.8) action = 'OPEN';
        leverage = 3.0;
    }

    if (action === 'OPEN') {
        // Call our internal position opener
        const baseUrl = new URL(req.url).origin;
        const res = await fetch(`${baseUrl}/api/positions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vaultId: manager.vault[0].id,
                symbol: 'BTC-USD',
                side,
                leverage,
                size: 0.1 // 0.1 BTC
            })
        });
        const posData = await res.json();
        return NextResponse.json({ success: true, manager: manager.name, decision: `OPENED ${side} @ 10x`, details: posData });
    }

    return NextResponse.json({ success: true, manager: manager.name, decision: 'HOLDING', details: 'No entry signal detected.' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
