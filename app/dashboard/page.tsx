import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import NavBar from '@/components/NavBar';
import DrawHistoryList from '@/components/DrawHistoryList';
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
          <DrawHistoryList draws={draws ?? []} />
        </div>
      </main>
    </>
  );
}
