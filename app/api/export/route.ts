import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { canUse } from '@/lib/plan';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = (user?.plan as 'free' | 'pro' | 'business') ?? 'free';

  if (!canUse('export', plan)) {
    return new Response('Upgrade to Pro to export draws', { status: 403 });
  }

  const { data: draws } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('user_id', userId)
    .order('drawn_at', { ascending: false })
    .limit(100);

  const url = new URL(req.url);
  const format = url.searchParams.get('format') ?? 'csv';

  if (format === 'csv') {
    const rows = [
      ['Title', 'Winners', 'Entry Count', 'Date'],
      ...(draws ?? []).map((d) => [
        `"${d.title}"`,
        `"${d.winners.join('; ')}"`,
        String(d.entries.length),
        new Date(d.drawn_at).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename="luckydraw-history.csv"',
      },
    });
  }

  return new Response('Unsupported format', { status: 400 });
}
