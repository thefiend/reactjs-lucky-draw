import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import NavBar from '@/components/NavBar';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = user?.plan ?? 'free';

  if (plan === 'free') {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Dashboard requires Pro</h1>
            <p className="text-gray-500 mb-6">Upgrade to Pro to save and revisit your draw history.</p>
            <Link href="/pricing" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">
              See Pricing
            </Link>
          </div>
        </main>
      </>
    );
  }

  const { data: draws } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('user_id', userId)
    .order('drawn_at', { ascending: false })
    .limit(50);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Draw History</h1>
          {!draws || draws.length === 0 ? (
            <p className="text-gray-500">No draws yet. <Link href="/" className="text-indigo-600">Run your first draw →</Link></p>
          ) : (
            <div className="space-y-4">
              {draws.map((draw) => (
                <div key={draw.id} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-gray-900">{draw.title}</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {draw.entries.length} entries · {draw.winners.length} winner{draw.winners.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {draw.winners.map((w: string) => (
                          <span key={w} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">{w}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(draw.drawn_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
