import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const owner = searchParams.get('owner');

        if (!owner) {
            return NextResponse.json({ success: false, error: 'Owner address required' }, { status: 400 });
        }

        const { data: agents, error } = await supabaseAdmin
            .from('AIAgent')
            .select('*')
            .eq('ownerAddress', owner)
            .order('createdAt', { ascending: false });

        if (error) throw error;

        // Same enrichment as public list but INCLUDE the apiKey
        const enrichedAgents = (agents || []).map(a => ({
            ...a,
            id: String(a.agentId),
            agentId: a.agentId,
            description: a.description || `${a.name} is a ${a.personality.toLowerCase()} neural agent operating on the Monad network.`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${a.name}`,
            owner: a.ownerAddress,
            // apiKey IS INCLUDED HERE
            apiKey: a.apiKey,
            agentType: a.personality === 'Aggressive' ? 'trader' : 'fund-manager',
            riskProfile: a.personality.toLowerCase(),
            reputationScore: 90,
            tvl: '$0.0M', // New agents start empty
            performance30d: '0.0%',
            targetAssets: ['ETH', 'BTC', 'SOL', 'MON'],
        }));

        return NextResponse.json({
            success: true,
            agents: enrichedAgents
        });
    } catch (error: any) {
        console.error('Error fetching my agents:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
