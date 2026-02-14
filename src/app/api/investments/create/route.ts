
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { txHash, agentId, userAddress, amount, shares } = body;

        if (!txHash || !agentId || !userAddress || !amount || !shares) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('investments')
            .insert([
                {
                    tx_hash: txHash,
                    agent_id: agentId,
                    user_address: userAddress,
                    amount,
                    shares,
                    status: 'ACTIVE'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, investment: data });
    } catch (error: any) {
        console.error('Error creating investment:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
