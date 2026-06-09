import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return hmac === signature;
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-signature') ?? '';
  const payload = await req.text();

  if (!verifySignature(payload, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const { meta, data } = JSON.parse(payload) as {
    meta: { event_name: string };
    data: {
      id?: string;
      attributes: {
        product_name?: string;
        trial_ends_at?: string | null;
        custom_data: { clerk_user_id: string };
      };
    };
  };

  const userId = data.attributes.custom_data.clerk_user_id;

  if (meta.event_name === 'subscription_created' || meta.event_name === 'subscription_updated') {
    const plan = data.attributes.product_name?.toLowerCase().includes('business') ? 'business' : 'pro';
    const trialEnds = data.attributes.trial_ends_at
      ? new Date(data.attributes.trial_ends_at).toISOString()
      : null;
    await supabaseAdmin
      .from('users')
      .update({ plan, ls_subscription_id: data.id ?? null, trial_ends: trialEnds })
      .eq('id', userId);
  }

  if (meta.event_name === 'subscription_cancelled') {
    await supabaseAdmin.from('users').update({ plan: 'free' }).eq('id', userId);
  }

  return Response.json({ ok: true });
}
