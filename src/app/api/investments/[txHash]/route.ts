
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ txHash: string }> }
) {
    const { txHash } = await params;
    try {
        // Fetch investment details from Supabase
        const { data: investment, error } = await supabaseAdmin
            .from('investments')
            .select(`
                *,
                agents (
                    id,
                    agentId,
                    name,
                    vault_address,
                    owner_address
                )
            `)
            .ilike('tx_hash', txHash)
            .single();

        if (error) return NextResponse.json({ success: false, error: 'Investment not found' }, { status: 404 });

        return NextResponse.json({ success: true, investment });
    } catch (error: any) {
        console.error('Error fetching investment:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
