import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = req.headers.get('x-signature') ?? '';
  const payload = await req.text();

  if (!verifySignature(payload, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  let parsed: {
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
  try {
    parsed = JSON.parse(payload);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  const { meta, data } = parsed;

  const userId = data.attributes.custom_data.clerk_user_id;

  if (meta.event_name === 'subscription_created' || meta.event_name === 'subscription_updated') {
    const plan = data.attributes.product_name?.toLowerCase().includes('business') ? 'business' : 'pro';
    const trialEnds = data.attributes.trial_ends_at
      ? new Date(data.attributes.trial_ends_at).toISOString()
      : null;
    const { error } = await supabaseAdmin
      .from('users')
      .update({ plan, ls_subscription_id: data.id ?? null, trial_ends: trialEnds })
      .eq('id', userId);
    if (error) return new Response('Database error', { status: 500 });
  }

  if (meta.event_name === 'subscription_cancelled') {
    const { error } = await supabaseAdmin.from('users').update({ plan: 'free' }).eq('id', userId);
    if (error) return new Response('Database error', { status: 500 });
  }

  return Response.json({ ok: true });
}
