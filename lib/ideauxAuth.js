export async function obtenirUserIdIdeaux(supabase) {
  if (!supabase?.auth?.getUser) throw new Error('Client Supabase Auth invalide');

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const userId = data?.user?.id;
  if (!userId) throw new Error('Utilisateur non connecté');
  return userId;
}
