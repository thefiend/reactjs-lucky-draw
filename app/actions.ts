'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function saveDrawAction({
  userId,
  entries,
  winners,
  title,
}: {
  userId: string;
  entries: string[];
  winners: string[];
  title: string;
}) {
  await supabaseAdmin.from('draws').insert({ user_id: userId, entries, winners, title });
}
