import { supabase } from './supabaseClient';

async function requireUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Utilisateur non connecté');
  return user;
}

export async function getMonPourquoi() {
  const user = await requireUser();
  const { data, error } = await supabase.from('profil').select('id, pourquoi, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.pourquoi || '';
}

export async function getMyWayItems({ includeArchived = false } = {}) {
  const user = await requireUser();
  let query = supabase.from('my_way_items').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
  if (!includeArchived) query = query.neq('status', 'archived');
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createMyWayItem({ itemType, content, source = 'user', status = 'validated' }) {
  const user = await requireUser();
  const normalizedContent = String(content || '').trim();
  if (!normalizedContent) throw new Error('Le contenu My Way ne peut pas être vide');
  const { data, error } = await supabase.from('my_way_items').insert({ user_id: user.id, item_type: itemType, content: normalizedContent, source, status }).select().single();
  if (error) throw error;
  return data;
}

export async function updateMyWayItem(id, updates = {}) {
  const user = await requireUser();
  const payload = { updated_at: new Date().toISOString() };
  if (updates.content !== undefined) {
    const normalizedContent = String(updates.content || '').trim();
    if (!normalizedContent) throw new Error('Le contenu My Way ne peut pas être vide');
    payload.content = normalizedContent;
  }
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.source !== undefined) payload.source = updates.source;
  if (updates.itemType !== undefined) payload.item_type = updates.itemType;
  const { data, error } = await supabase.from('my_way_items').update(payload).eq('id', id).eq('user_id', user.id).select().single();
  if (error) throw error;
  return data;
}

export async function archiveMyWayItem(id) {
  return updateMyWayItem(id, { status: 'archived' });
}
