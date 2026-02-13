import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { data: agents, error } = await supabaseAdmin
            .from('AIAgent')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        // Enrich with UI-friendly data
        const enrichedAgents = (agents || []).map(a => ({
            ...a,
            id: String(a.agentId),
            agentId: a.agentId,
            description: `${a.name} is a ${a.personality.toLowerCase()} neural agent operating on the Monad network. Optimized for high-frequency strategies.`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${a.name}`,
            owner: a.ownerAddress,
            agentType: a.personality === 'Aggressive' ? 'trader' : 'fund-manager',
            riskProfile: a.personality.toLowerCase(),
            reputationScore: Math.floor(Math.random() * 20) + 80,
            tvl: `$${(Math.random() * 10 + 1).toFixed(1)}M`,
            aum: (Math.random() * 10000000 + 1000000),
            apy: (Math.random() * 30 + 5).toFixed(1),
            winRate: Math.floor(Math.random() * 30) + 60,
            totalTrades: Math.floor(Math.random() * 200) + 50,
            performance30d: `${(Math.random() * 40 - 5).toFixed(1)}%`,
            targetAssets: ['ETH', 'BTC', 'SOL', 'MON'],
            activePositions: [],
            recentDecisions: [
                {
                    id: `dec-${a.agentId}`,
                    timestamp: Date.now() - 1000 * 60 * 30,
                    action: 'HOLD',
                    reasoning: 'Analyzing market depth and parallel execution throughput on Monad.',
                    pair: 'MON/USDT',
                    price: 1.25,
                    proof: '0xabc...def'
                }
            ],
            history: Array.from({ length: 20 }, (_, i) => ({
                timestamp: Date.now() - (20 - i) * 1000 * 60 * 60 * 24,
                pnl: 10 + Math.random() * 20
            }))
        }));

        return NextResponse.json({
            success: true,
            agents: enrichedAgents
        });
    } catch (error: any) {
        console.error('Error fetching agents:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
