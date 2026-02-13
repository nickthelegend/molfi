import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { data: agents, error } = await supabaseAdmin
            .from('AIAgent')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            agents: agents || []
        });
    } catch (error: any) {
        console.error('Error fetching agents:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
