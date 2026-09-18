const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
const lire = chemin => fs.readFileSync(path.join(racine, chemin), 'utf8');

describe('Intégration du mode trou de suivi', () => {
  test('raccorde le questionnaire au suivi sans utilisateur de secours', () => {
    const page = lire('pages/suivi.js');
    const persistence = lire('lib/trouSuiviPersistence.js');

    expect(page).toContain('<ModeTrouSuiviCard');
    expect(page).toContain('detecterTrousSuivi');
    expect(page).toContain('synchroniserTrousSuiviEnAttente');
    expect(page).toContain('onIgnore={handleIgnorerTrouSuivi}');
    expect(page).toContain('sauvegarderPeriodeReconstituee(supabase, userId, payload)');
    expect(persistence).toContain("const TABLE_PERIODES = 'suivi_periodes_estimees'");
    expect(persistence).not.toContain(".from('suivi_periodes_reconstituees')");
    expect(`${page}\n${persistence}`).not.toContain('laurelle_test_user');
  });

  test('conserve les trous historiques avec un cycle de décision explicite', () => {
    const migration = lire('supabase/migrations/20260918100000_conserver_trous_suivi_historiques.sql');
    expect(migration).toContain("'a_completer'");
    expect(migration).toContain("'reportee'");
    expect(migration).toContain("'reconstituee'");
    expect(migration).toContain("'ignoree'");
  });

  test('persiste séparément les jours sans donnée', () => {
    const page = lire('pages/suivi.js');
    const migration = lire('supabase/migrations/20260916203542_upgrade_suivi_periodes_estimees.sql');

    expect(page).toContain('jours_sans_donnee: couvertureSemaine.joursSansDonnee');
    expect(migration).toContain('add column if not exists jours_sans_donnee');
  });

  test('protège les périodes par utilisateur avec RLS', () => {
    const migration = lire('supabase/migrations/20260916203542_upgrade_suivi_periodes_estimees.sql');

    expect(migration).toContain('enable row level security');
    expect(migration).toContain('drop policy if exists "ok"');
    expect(migration).toContain('revoke all on table public.suivi_periodes_estimees from anon');
    expect(migration).toContain('using ((select auth.uid()) = user_id)');
    expect(migration).toContain('with check ((select auth.uid()) = user_id)');
  });

  test('met à niveau la table existante sans en créer une seconde', () => {
    const migration = lire('supabase/migrations/20260916203542_upgrade_suivi_periodes_estimees.sql');

    expect(migration).toContain('alter table public.suivi_periodes_estimees');
    expect(migration).not.toContain('create table');
    expect(migration).not.toContain('suivi_periodes_reconstituees');
  });
});
