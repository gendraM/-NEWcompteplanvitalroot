// Ces lectures partagées gardent les règles métier des modules inchangées.
async function utilisateurVerifie(client, expectedUserId) {
  const { data, error } = await client.auth.getUser();
  const userId = data?.user?.id;
  if (error || !userId || userId !== expectedUserId) throw new Error('Connexion requise.');
  return userId;
}

export async function chargerProfilNavigation(client, expectedUserId) {
  const userId = await utilisateurVerifie(client, expectedUserId);
  const { data, error } = await client.from('profil').select('sexe, niveau_activite')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error('Profil indisponible.');
  return data;
}

export async function chargerDefisNavigation(client, expectedUserId) {
  const userId = await utilisateurVerifie(client, expectedUserId);
  const { data, error } = await client.from('defis').select('*').eq('user_id', userId);
  if (error) throw new Error('Défis indisponibles.');
  return data || [];
}
