import { chargerIdeauxAvecProgression } from './ideauxProgression';
import { chargerPeriodesReconstituees } from './trouSuiviPersistence';

// Lecture uniquement : ni RPC, ni synchronisation, ni écriture implicite.
// Les erreurs restent distinctes d'une période réellement vide.
export async function chargerDonneesDashboard(client, { debut, fin, expectedUserId } = {}) {
  const { data: auth, error: authError } = await client.auth.getUser();
  const userId = auth?.user?.id;
  if (authError || !userId || (expectedUserId && expectedUserId !== userId)) {
    throw new Error('Connexion requise pour consulter ton tableau de bord.');
  }
  const own = table => client.from(table).select('*').eq('user_id', userId);
  const period = table => own(table).gte('date', debut).lte('date', fin);
  const jobs = {
    poids: () => period('historique_poids').order('date', { ascending: true }),
    repas: () => period('repas_reels').order('date', { ascending: true }),
    humeurs: () => period('humeur_checkin'),
    // Le palier utilise tout l'historique utilisateur, jamais la seule période affichée.
    semaines: () => own('semaines_validees').order('weekStart', { ascending: true }),
    profil: () => own('profil').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    badges: () => own('badges').order('date_obtention', { ascending: false }),
    evenementsExtras: () => own('extras_palier_events').order('semaine_decisive', { ascending: true }),
    defis: () => own('defis'),
    dernierFastFood: () => own('repas_reels').eq('categorie', 'fast-food')
      .order('date', { ascending: false }).limit(1).maybeSingle(),
    ideaux: async () => ({ data: await chargerIdeauxAvecProgression(client, userId) }),
    periodes: () => chargerPeriodesReconstituees(client, userId),
  };
  const entries = await Promise.all(Object.entries(jobs).map(async ([domain, job]) => {
    try {
      const result = await job();
      return [domain, result.error ? { error: true } : { data: result.data }];
    } catch {
      return [domain, { error: true }];
    }
  }));
  const errors = entries.filter(([, result]) => result.error).map(([domain]) => domain);
  return { userId, errors, ...Object.fromEntries(entries.map(([domain, result]) => [
    domain, result.data ?? (['profil', 'dernierFastFood'].includes(domain) ? null : []),
  ])) };
}
