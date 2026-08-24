const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const context = { module: { exports: {} }, exports: {}, Date, Error };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '../lib/listeCoursesGeneraleSync.js'), 'utf8')
    .replace(/export function /g, 'function ')
    .replace(/export async function /g, 'async function ')
    .concat('\nmodule.exports = { construireSnapshotListeCoursesGenerale, restaurerSnapshotListeCoursesGenerale, chargerListeCoursesGenerale, sauvegarderListeCoursesGenerale };');
  vm.runInContext(source, context, { filename: 'listeCoursesGeneraleSync.js' });
  return context.module.exports;
}

const {
  construireSnapshotListeCoursesGenerale,
  restaurerSnapshotListeCoursesGenerale,
  sauvegarderListeCoursesGenerale
} = chargerModule();

function fauxSupabase(ligneExistante = null) {
  const appels = [];
  return {
    appels,
    from(table) {
      const appel = { table, action: 'lecture', filtres: [], payload: null };
      appels.push(appel);
      const requete = {
        select() { return requete; },
        eq(champ, valeur) { appel.filtres.push([champ, valeur]); return requete; },
        is(champ, valeur) { appel.filtres.push([champ, valeur]); return requete; },
        order() { return requete; },
        limit() { return requete; },
        maybeSingle: async () => ({ data: ligneExistante, error: null }),
        update(payload) { appel.action = 'update'; appel.payload = payload; return requete; },
        insert(payload) { appel.action = 'insert'; appel.payload = payload; return requete; },
        single: async () => ({ data: { id: ligneExistante?.id || 'nouvelle-liste', created_at: '2026-08-24T12:00:00Z' }, error: null })
      };
      return requete;
    }
  };
}

const liste = {
  periode: { debut: '2026-08-24', fin: '2026-08-30' },
  articles: [{ article_id: 'oeuf', statut_achat: 'panier', conditionnement_achat: { valeur: 6, unite: 'unité' } }],
  incomplets: [],
  resume: { lignes_planifiees: 1 }
};

describe('Persistance de la liste de courses générale', () => {
  test('conserve dans le JSON les articles, conditionnements, statuts et montants globaux', () => {
    const snapshot = construireSnapshotListeCoursesGenerale(liste, '50', '47.80');
    expect(snapshot).toMatchObject({ contexte: 'plan_general', prix_estime: '50', prix_reel: '47.80' });
    expect(snapshot.articles[0]).toMatchObject({ statut_achat: 'panier', conditionnement_achat: { valeur: 6 } });
  });

  test('restaure uniquement une liste générale valide', () => {
    const snapshot = construireSnapshotListeCoursesGenerale(liste, 50, null);
    expect(restaurerSnapshotListeCoursesGenerale({ id: 'liste-1', liste_json: snapshot })).toMatchObject({ id: 'liste-1', prix_estime: 50 });
    expect(restaurerSnapshotListeCoursesGenerale({ id: 'autre', liste_json: { contexte: 'cristallisation', articles: [] } })).toBe(null);
  });

  test('insère la première liste sans parcours de cristallisation', async () => {
    const supabase = fauxSupabase();
    const resultat = await sauvegarderListeCoursesGenerale(supabase, 'user-1', liste, 50, null);
    const ecriture = supabase.appels.find(appel => appel.action === 'insert');
    expect(resultat.error).toBe(null);
    expect(ecriture.payload).toMatchObject({ user_id: 'user-1', parcours_id: null, nb_jours: 7 });
  });

  test('met à jour la même ligne pour la même période', async () => {
    const supabase = fauxSupabase({ id: 'liste-1', liste_json: construireSnapshotListeCoursesGenerale(liste), semaine_debut: '2026-08-24', semaine_fin: '2026-08-30' });
    await sauvegarderListeCoursesGenerale(supabase, 'user-1', liste, 50, 48);
    const ecriture = supabase.appels.find(appel => appel.action === 'update');
    expect(ecriture).toBeTruthy();
    expect(ecriture.filtres).toContainEqual(['id', 'liste-1']);
    expect(ecriture.payload.liste_json).toMatchObject({ prix_estime: 50, prix_reel: 48 });
  });
});
