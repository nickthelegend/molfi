import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

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

        // Fetch recent signals for this agent
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
                recentDecisions: signals || []
            }
        });
    } catch (error: any) {
        console.error('Error fetching agent detail:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
