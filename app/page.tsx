import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DrawTool from '@/components/DrawTool';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Lucky Draw Online Generator | Free Random Winner Picker Tool',
  description: 'Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool. Fair, fast & transparent — no registration needed.',
  alternates: { canonical: 'https://luckydraw.me' },
  openGraph: {
    title: 'Lucky Draw Online Generator — Free Random Winner Picker',
    description: 'Use our free lucky draw online generator to instantly select random winners for raffles, giveaways, contests & events.',
    url: 'https://luckydraw.me',
    images: [{ url: 'https://luckydraw.me/images/luckydraw-share.png', width: 1200, height: 630 }],
  },
};

export default async function HomePage() {
  const { userId } = await auth();
  let plan: 'free' | 'pro' | 'business' = 'free';

  if (userId) {
    const { data } = await supabaseAdmin.from('users').select('plan').eq('id', userId).single();
    plan = (data?.plan as typeof plan) ?? 'free';
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen py-14" style={{ background: 'radial-gradient(ellipse 100% 55% at 50% -5%, rgba(19,157,217,0.09) 0%, transparent 65%), linear-gradient(175deg, #f8fcff 0%, #eef7fd 55%, #f4faff 100%)' }}>
        <DrawTool plan={plan} userId={userId ?? undefined} />
      </main>
    </>
  );
}
